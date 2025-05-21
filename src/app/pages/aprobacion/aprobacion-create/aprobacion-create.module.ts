import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';


import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { AprobacionCreatePageRoutingModule } from './aprobacion-create-routing.module';
import { AprobacionCreatePage } from './aprobacion-create.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AprobacionCreatePageRoutingModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [AprobacionCreatePage]
})
export class AprobacionCreatePageModule {}
