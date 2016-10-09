import { NgModule, ModuleWithProviders } from '@angular/core';
import { SlimLoadingBarComponent, SlimLoadingBarService } from 'ng2-slim-loading-bar';

import { LoadingComponent } from './loading/index';

@NgModule({
  imports: [],
  declarations: [
    LoadingComponent,
    SlimLoadingBarComponent
  ],
  exports: [
    LoadingComponent
  ]
})
export class LoadingModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: LoadingModule,
      providers: [
        SlimLoadingBarService
      ]
    };
  }
}
