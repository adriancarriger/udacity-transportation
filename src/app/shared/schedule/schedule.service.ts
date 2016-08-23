import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/publishLast';

@Injectable()
export class ScheduleService {
  private tempTrainData = {
    weekdays: [],
    weekends: []
  };
  constructor(private http: Http) { }
  public weekdayRoutes(): Array<Object> {
    if (this.tempTrainData.weekdays.length === 0) {
      for (let i = 0; i < 15; i++) {
        this.tempTrainData.weekdays.push({
          departure: '7:12am',
          arrival: '8:01am',
          stops: '22nd Street, Millbrae, Hillsdale, Palo Alto' 
        }); 
      }
    }
    return this.tempTrainData.weekdays;
  }

  public weekendRoutes(): Array<Object> {
    if (this.tempTrainData.weekends.length === 0) {
      for (let i = 0; i < 10; i++) {
        this.tempTrainData.weekends.push({
          departure: '11:59am',
          arrival: '12:49pm',
          stops: 'Millbrae, San Mateo, Hillsdale, Redwood City, Palo Alto' 
        }); 
      }
    }
    return this.tempTrainData.weekends;
  }

  /**
   * Returns an Observable for the HTTP GET request for the JSON resource.
   * @return {string[]} The Observable for the HTTP request.
   */
  get(): Observable<any> {
    return this.http.get( 'app/assets/schedule.json' )
                    .map((res: Response) => res.json())
                    .publishLast().refCount()
                    .catch(this.handleError);
  }

  /**
    * Handle HTTP error
    */
  private handleError (error: any) {
    // In a real world app, we might use a remote logging infrastructure
    // We'd also dig deeper into the error to get a better message
    let errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg); // log to console instead
    return Observable.throw(errMsg);
  }

}
