import { Injectable } from '@angular/core';

@Injectable()
export class ScheduleService {
  private tempTrainData = {
    weekdays: [],
    weekends: []
  };
  constructor() { }
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

}
