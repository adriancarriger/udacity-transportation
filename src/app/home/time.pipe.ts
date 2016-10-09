import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'appTime'
})
export class TimePipe implements PipeTransform {

  public transform(value: any, args?: any): any {
    if (value === null) { return null; }
    return this.formatTime(value);
  }

  private formatTime(input: string): string {
    let timeSections = input.split(':');
    let hrNum: number = Number( timeSections[0] );
    if (hrNum >= 24) { hrNum = hrNum - 24; }
    timeSections[0] = hrNum + '';
    let time = timeSections.join('');
    return moment(time, 'Hmmss').format('h:mma');
  }

}
