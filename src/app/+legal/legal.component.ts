import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-legal',
  templateUrl: 'legal.component.html',
  styleUrls: ['legal.component.scss']
})
export class LegalComponent implements OnInit {
  public type: string;
  constructor(private activatedRoute: ActivatedRoute) {}
  ngOnInit() {
    this.type = this.activatedRoute.snapshot.url[0].path;
  }
}
