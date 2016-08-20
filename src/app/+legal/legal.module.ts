import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';
import { LegalComponent } from './legal.component';

@NgModule({
    imports: [CommonModule, SharedModule],
    declarations: [LegalComponent],
    exports: [LegalComponent],
    providers: []
})

export class LegalModule { }
