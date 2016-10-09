import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';
import { HomeComponent } from './home.component';
import { TimePipe } from './time.pipe';

@NgModule({
    imports: [CommonModule, SharedModule],
    declarations: [HomeComponent, TimePipe],
    exports: [HomeComponent],
    providers: []
})

export class HomeModule { }
