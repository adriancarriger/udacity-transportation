import { Component, ViewEncapsulation } from '@angular/core';
import { ROUTER_DIRECTIVES } from '@angular/router';

import { NavbarComponent } from './shared/index';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  directives: [ROUTER_DIRECTIVES],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent {
  title = 'app works!';
}
