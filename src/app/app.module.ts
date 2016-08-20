import { NgModule, ApplicationRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { routes } from './app.routes';

import { HomeModule } from './+home/home.module';
import { LegalModule } from './+legal/legal.module';
import { SharedModule } from './shared/shared.module';

@NgModule({
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    HomeModule,
    LegalModule,
    SharedModule.forRoot()
  ],
  declarations: [
    AppComponent
  ],
  entryComponents: [AppComponent],
  bootstrap: [AppComponent]
})
export class AppModule {

}
