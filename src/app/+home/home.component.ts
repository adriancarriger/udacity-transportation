import { Component, OnInit, ViewChild } from '@angular/core';
import { ScheduleService } from '../shared/index';
import { TimePipe } from './time.pipe';

@Component({
  selector: 'app-home',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.scss'],
  pipes: [TimePipe]
})
export class HomeComponent implements OnInit {
  public weekPeriod: string = 'weekday';

  constructor(private schedule: ScheduleService) { }

  ngOnInit() {
    this.schedule.init();
  }

}
