import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/publishLast';

@Injectable()
export class ScheduleService {
  public stations = [];
  public trainData;
  public selectedRoute = {
    station1: null,
    station2: null
  };
  public routeOptions = [];
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
    this.updateRoute();
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

  private updateRoute():void {
    let station1 = Number( this.selectedRoute.station1 );
    let station2 = Number( this.selectedRoute.station2 );
    let goingNorth:boolean;
    if (station1 !== null && station2 !== null && station1 !== station2) {
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
      let weekdayRoutes = [];
      let weekendRoutes = [];
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
            departure: stops[ station1 ].time,
            arrival: stops[ station2 ].time,
            stops: stopsString,
            moreStops: moreStopsString
          };
          if (isWeekdayRoute) {
            weekdayRoutes.push( theseRoutes );
          } else {
            weekendRoutes.push( theseRoutes );
          }
        }
        
      } else {
        // return no matches found...
        console.log('no matches found');
      }
      this.routeOptions = [
        {
          name: 'Weekdays',
          routes: weekdayRoutes
        },
        {
          name: 'Weekends',
          routes: weekendRoutes
        }
      ];
      
    }
    
  }

  private matchingTrips(tripIds1:Array<number>, tripIds2:Array<number>) {
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

  private getStations():void {
    this.get().subscribe( data => {
      this.trainData = data;
      let temp = [];
      for (let key in data.stopsMeta) {
        let stationName = data.stopsMeta[key];
        if (temp.indexOf(stationName) === -1) {
          temp.push(stationName);
          this.stations.push({
            name: stationName, // station name
            id: key // station id
          });
        }
      }
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
