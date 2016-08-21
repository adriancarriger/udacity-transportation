import { Component, OnInit } from '@angular/core';
import { ScheduleService } from '../shared/index';

@Component({
  selector: 'app-home',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.scss']
})
export class HomeComponent implements OnInit {
  
  constructor(private schedule: ScheduleService) { }

  ngOnInit() {
  }

}
