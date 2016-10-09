import { Component, OnInit } from '@angular/core';
import { ScheduleService } from '../shared/index';

@Component({
  selector: 'app-home',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.scss']
})
export class HomeComponent implements OnInit {
  public weekPeriod: string = 'weekday';

  constructor(private schedule: ScheduleService) { }

  ngOnInit() {
    this.schedule.init();
  }

}
