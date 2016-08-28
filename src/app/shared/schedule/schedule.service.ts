import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/publishLast';
import * as moment from 'moment';

@Injectable()
export class ScheduleService {
  public stations = [];
  public defaultSchedule = {
    weekday: [],
    weekend: []
  };
  public trainData;
  public nextAvailable = {
    until: null,
    departing: null,
    from: null,
    arriving: null,
    to: null
  };
  public selectedRoute = {
    station1: null,
    station2: null
  };
  public routeOptions = [];
  public routesTotal:number = 0;
  private interval;
  private nowMoment;
  private tempTrainData = {
    weekdays: [],
    weekends: []
  };
  constructor(private http: Http) { }

  public init():void {
    this.getStations();
    this.selectedRoute = {
      station1: null,
      station2: null
    };
  }

  public stationSelected(event, station):void {
    this.selectedRoute['station' + station] = event.target.value;
    this.updateRoutes();
  }

  /**
   * Returns an Observable for the HTTP GET request for the JSON resource.
   * @return {string[]} The Observable for the HTTP request.
   */
  public get(): Observable<any> {
    return this.http.get( 'app/assets/schedule.json' )
                    .map((res: Response) => res.json())
                    .publishLast().refCount()
                    .catch(this.handleError);
  }

  private validRoute():boolean {
    let station1 = Number( this.selectedRoute.station1 );
    let station2 = Number( this.selectedRoute.station2 );
    return station1 !== 0 && station2 !== 0 && station1 !== station2;
  }

  private updateRoutes():void {
    let station1 = Number( this.selectedRoute.station1 );
    let station2 = Number( this.selectedRoute.station2 );
    let goingNorth:boolean;
    let weekdayRoutes = [];
    let weekendRoutes = [];
    if ( this.validRoute() ) {
      if (station2 < station1) {
        // going north
        goingNorth = true;
        if (!this.isOdd(station1)) {
          station1 = station1 - 1;
        }
        if (!this.isOdd(station2)) {
          station2 = station2 - 1;
        }
      } else {
        // going south
        goingNorth = false;
        if (this.isOdd(station1)) {
          station1 = station1 + 1;
        }
        if (this.isOdd(station2)) {
          station2 = station2 + 1;
        }
      }
      // Find matching trips
      let matched:Array<number> = this.matchingTrips(
          this.trainData.indexedStops[station1],
          this.trainData.indexedStops[station2]);
      if (matched.length > 0) {
        // Max stops shown before a "more" button is shown
        let maxBeforeHide = 3;
        for (let i = 0; i < matched.length; i++) {
          let routeId = matched[i];
          // All weekday routes are less than 400
          let isWeekdayRoute:boolean = routeId < 400;
          // All stops including start and end station
          let stops = this.trainData.metaInfo[ routeId ];
          // Stops shown without "more" button being clicked
          let stopsString:string = '';
          // Additional stops shown after "more" button is clicked
          let moreStopsString:string = null;
          // Find matching stops
          let matchedStops = [];
          for (let stop_id in stops) {
            let stop_number = Number( stop_id );
            // If a stop is between the start and end station
            if (goingNorth) {
              if (stop_number < station1 && stop_number > station2) {
                // Add to the array of stops to be displayed
                matchedStops.push(stop_id);
              }
            } else {
              if (stop_number > station1 && stop_number < station2) {
                // Add to the array of stops to be displayed
                matchedStops.push(stop_id);
              }
            } 
          }
          if (matchedStops.length > 2) {
            // sort stops here
            // * * * * * * * *
            for (let n = 0; n < matchedStops.length; n++) {
              if (n <= maxBeforeHide) {
                stopsString = stopsString + this.trainData.stopsMeta[ matchedStops[n] ] + ', ';
              }
              if (n > maxBeforeHide) {
                if (moreStopsString === null) { moreStopsString = ''; }
                moreStopsString = moreStopsString + ', ' + this.trainData.stopsMeta[ matchedStops[n] ]
              } 
            }
            // Remove last comma
            stopsString = stopsString.substr(0, stopsString.length - 2);
          } else {
            // non stop
            stopsString = 'non-stop';
          }
          let theseRoutes = {
            sortNum: stops[ station1 ].time.split(':').join(''),
            departure: this.formatTime( stops[ station1 ].time ),
            arrival: this.formatTime( stops[ station2 ].time ),
            satOnly: stops[ station1 ].satOnly,
            stops: stopsString,
            moreStops: moreStopsString,
            trip_id: routeId
          };
          if (isWeekdayRoute) {
            weekdayRoutes.push( theseRoutes );
          } else {
            weekendRoutes.push( theseRoutes );
          }
        } 
      }
    }
    // Sort by departure time
    weekdayRoutes.sort(this.sortRoutes);
    weekendRoutes.sort(this.sortRoutes);
    this.routeOptions = [
      {
        name: 'Weekdays',
        routes: weekdayRoutes,
        station: station1
      },
      {
        name: 'Weekends',
        routes: weekendRoutes,
        station: station1
      }
    ];
    this.routesTotal = weekdayRoutes.length + weekendRoutes.length;
    this.nextAvailableTrain();
    clearInterval( this.interval );
    this.interval = setInterval( () => { this.nextAvailableTrain(); }, 15000);
  }

  private formatTime(input: string): string {
    let timeSections = input.split(':');
    let hrNum: number = Number( timeSections[0] );
    if (hrNum >= 24) { hrNum = hrNum - 24; }
    timeSections[0] = hrNum + '';
    let time = timeSections.join('');
    return moment(time, 'Hmmss').format('h:mma');
  }

  private sortRoutes(a, b) {
    return a.sortNum - b.sortNum;
  }

  /**
   * - Returns the index of the appropriate schedule (either weekday or weekend schedule)
   * - an index of 0 is weekday, 1 is weekend
   */
  private getScheduleIndex(offset?: number): number {
    let indexDay = this.nowMoment.clone();
    let index;
    if (offset !== 0) {
      indexDay.add(offset, 'd');
    }
    let isWeekend = indexDay.format('d') === '0' || indexDay.format('d') === '6';
    if (isWeekend) { index = 1; } else { index = 0; }
    return index;
  }

  private nextAvailableTrain() {
    if ( !this.validRoute() ) { return; }
    this.nowMoment = moment();
    let nextTrainMoment = this.nowMoment.clone();
    // If the current time is a weekend
    let index: number = this.getScheduleIndex();
    let stationNum: number = this.routeOptions[ index ].station;
    let nowNum: number = Number( this.nowMoment.format('Hmmss') );
    let found: boolean = false;
    let searchToday: boolean = true;
    let departingStation = this.trainData.stopsMeta[ this.selectedRoute.station1 ];
    let arrivingStation = this.trainData.stopsMeta[ this.selectedRoute.station2 ];
    // If none found for today's schedule (either weekday or weekend schedule),
    // then check the other schedule
    if (this.routeOptions[index].routes.length === 0) {
      if (index === 0) {
        // Weekend
        index = 1;
        nextTrainMoment = this.nowMoment.clone().day(7 + 5); // This Friday
      } else {
        // Weekday
        index = 0;
        nextTrainMoment = this.nowMoment.clone().day(7 + 1); // This Monday
      }
      searchToday = false;
    }
    // TODO: If 1) it's the end of Saturday and 2) there's no train on Sunday between the
    // two stations, then search for trips on Monday
    if (searchToday) {
      for (let i = 0; !found && i < this.routeOptions[index].routes.length; i++) {
        let thisSortNum: number = Number( this.routeOptions[index].routes[i].sortNum );
        // Use the first route that leaves in the future
        if (thisSortNum > nowNum
          && (this.nowMoment.format('d') !== '0'
            || this.routeOptions[index].routes[i].satOnly === false) ) {
          // If hours are greater than 24, change moment to next day
          if (thisSortNum > 240000) { nextTrainMoment.add(1, 'd'); }       
          this.setNextAvailable(nextTrainMoment, this.routeOptions[index].routes[i]);
          found = true;
        }
      }
      // If after searching today's schedule there is nothing found,
      // then check the next days's schedule
      if (!found) {
        index = this.getScheduleIndex(1);
        nextTrainMoment.add(1, 'd');
      }
    }
    if (!found || !searchToday) {
      if (this.routeOptions[index].routes.length) {
        // use earliest route of next day
        if (nextTrainMoment.format('d') === '0') { // If Sunday
          // loop through routes and find a non-sat only else go to monday
          for (let i = 0; i < this.routeOptions[index].routes.length; i++) {
            let thisSortNum: number = Number( this.routeOptions[index].routes[i].sortNum );
            let satOnly = this.routeOptions[index].routes[i].satOnly;
            if (!satOnly) {    
              // If hours are greater than 24, change moment to next day
              if (thisSortNum > 240000) { nextTrainMoment.add(1, 'd'); }      
              this.setNextAvailable(nextTrainMoment, this.routeOptions[index].routes[i]);
              break;
            }
          }
        } else {
          this.setNextAvailable(nextTrainMoment, this.routeOptions[index].routes[0]);
        }
      } else {
        // no routes
        this.setNextAvailable();
      }
    }
  }

  private setNextAvailable(thisMoment?, route?): void {
    moment.relativeTimeThreshold('s', 60);
    moment.relativeTimeThreshold('m', 60);
    moment.relativeTimeThreshold('h', 24);
    moment.relativeTimeThreshold('d', 30);
    moment.relativeTimeThreshold('M', 12);
    let departing = null;
    let arrival = null;
    let until = null;
    if (route !== null && route !== undefined) {
      until = this.momentTimeMoment(thisMoment, route.departure).from(this.nowMoment);
      departing = this.momentTimeString(thisMoment, route.departure);
      arrival = route.arrival;
    }
    this.nextAvailable = {
      until: until,
      departing: departing,
      from: this.trainData.stopsMeta[ this.selectedRoute.station1 ],
      arriving: arrival,
      to: this.trainData.stopsMeta[ this.selectedRoute.station2 ]
    };
  }

  private momentTimeString(thisMoment, time: string): string {
    let newMoment = this.momentTimeMoment(thisMoment, time);
    return newMoment.calendar(this.nowMoment, {
      sameDay: '[today at ]h:mma',
      nextDay: '[tomorrow at ]h:mma',
      nextWeek: 'dddd',
      lastDay: '[yesterday]',
      lastWeek: '[last] dddd',
      sameElse: 'DD/MM/YYYY'
    });
  }

  private momentTimeMoment(thisMoment, time: string) {
    let dFormat: string = 'YYYY-MM-DD';
    let nextTrainTime: string = thisMoment.format(dFormat);
    nextTrainTime = nextTrainTime + ' ' + time;
    return moment(nextTrainTime, dFormat + ' h:mma');
  }


  private matchingTrips(tripIds1: Array<number>, tripIds2: Array<number>) {
    let tripIds = [];
    if (tripIds1 !== undefined && tripIds2 !== undefined) {
      for (let i = 0; i < tripIds1.length; i++) {
        if (tripIds2.indexOf( tripIds1[i] ) !== -1) {
          tripIds.push( tripIds1[i] );
        } 
      }
    }
    return tripIds;
  }

  private getStations(): void {
    this.get().subscribe( data => {
      this.trainData = data;
      let temp = [];
      let weekdayNorth = [];
      let weekdaySouth = [];
      let weekendNorth = [];
      let weekendSouth = [];
      for (let key in data.stopsMeta) {
        let stationName = data.stopsMeta[key];
        if (temp.indexOf(stationName) === -1) {
          temp.push(stationName);
          this.stations.push({
            name: stationName, // station name
            id: key // station id
          });
          // Create default schedule
          let weekdayN = false;
          let weekendN = false;
          // North
          for (let i = 0; (!weekdayN || !weekendN ) && i < this.trainData.indexedStops[key].length; i++) {
            if (this.trainData.indexedStops[key][i] < 400) {
              // Weekday North
              if (!weekdayN) {
                weekdayNorth.push({
                  name: stationName,
                  id: key
                });
                weekdayN = true;
              }
            } else {
              // Weekend North
              if (!weekendN) {
                weekendNorth.push({
                  name: stationName,
                  id: key
                });
                weekendN = true;
              }
            }
          }
          // South
          let weekdayS = false;
          let weekendS = false;
          let southKey = (Number(key) + 1) + '';
          for (let i = 0; (!weekdayS || !weekendS ) && i < this.trainData.indexedStops[southKey].length; i++) {
            if (this.trainData.indexedStops[southKey][i] < 400) {
              // Weekday North
              if (!weekdayS) {
                weekdaySouth.push({
                  name: stationName,
                  id: southKey
                });
                weekdayS = true;
              }
            } else {
              // Weekend North
              if (!weekendS) {
                weekendSouth.push({
                  name: stationName,
                  id: southKey
                });
                weekendS = true;
              }
            }
          }
        }
      }
      this.defaultSchedule.weekday = [
        {
          name: 'Northbound',
          group: 'weekdayNorth',
          items: weekdayNorth
        },
        {
          name: 'Soundbound',
          group: 'weekdaySouth',
          items: weekdaySouth
        }
      ];
      this.defaultSchedule.weekend  = [
        {
          name: 'Northbound',
          group: 'weekendNorth',
          items: weekendNorth
        },
        {
          name: 'Soundbound',
          group: 'weekendSouth',
          items: weekendSouth
        }
      ];
    });
  }

  /**
    * Handle HTTP error
    */
  private handleError (error: any) {
    let errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg); // log to console
    return Observable.throw(errMsg);
  }

  private isOdd(x) { return x & 1; }

}
