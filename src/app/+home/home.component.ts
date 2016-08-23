import { Component, OnInit } from '@angular/core';
import { ScheduleService } from '../shared/index';

@Component({
  selector: 'app-home',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.scss']
})
export class HomeComponent implements OnInit {
  public stations = [];
  constructor(private schedule: ScheduleService) { }

  ngOnInit() {
    this.schedule.get().subscribe( data => {
      console.log( data );
      let temp = [];
      for (var key in data.stopsMeta) {
        var stationName = data.stopsMeta[key];
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

}
