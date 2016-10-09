import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import { routes } from './app.routes';

import { HomeModule } from './home/home.module';
import { LegalModule } from './legal/legal.module';
import { SharedModule } from './shared/shared.module';
import { LoadingModule } from './loading/loading.module';

@NgModule({
  imports: [
    BrowserModule,
    HttpModule,
    RouterModule.forRoot(routes),
    HomeModule,
    LegalModule,
    SharedModule.forRoot(),
    LoadingModule.forRoot()
  ],
  declarations: [
    AppComponent
  ],
  entryComponents: [AppComponent],
  bootstrap: [AppComponent]
})
export class AppModule {

}
