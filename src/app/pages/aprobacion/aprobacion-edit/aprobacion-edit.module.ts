import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { AprobacionEditPage } from './aprobacion-edit.page';
import { AprobacionEditPageRoutingModule } from './aprobacion-edit-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AprobacionEditPageRoutingModule,
    ReactiveFormsModule,
    SharedModule,
  ],
  declarations: [AprobacionEditPage],
})
export class AprobacionEditPageModule {}
