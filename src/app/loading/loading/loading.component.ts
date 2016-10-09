import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { SlimLoadingBarService } from 'ng2-slim-loading-bar';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LoadingComponent implements OnInit {

  constructor(
    private slimLoader: SlimLoadingBarService,
    private router: Router) { }

  public ngOnInit(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.runSlimLoader();
      }
    }, (error: any) => {
      this.slimLoader.complete();
    });
  }

  private runSlimLoader(): void {
      this.slimLoader.start();
      setTimeout(() => this.slimLoader.progress = 14, 100);
      setTimeout(() => this.slimLoader.progress = 50, 200);
      setTimeout(() => this.slimLoader.progress = 70, 300);
      setTimeout(() => this.slimLoader.progress = 72, 350);
      setTimeout(() => this.slimLoader.progress = 76, 400);
      setTimeout(() => this.slimLoader.progress = 78, 450);
      setTimeout(() => this.slimLoader.progress = 79, 500);
      setTimeout(() => this.slimLoader.progress = 80, 600);
      setTimeout(() => this.slimLoader.complete(), 800);
  }

}
