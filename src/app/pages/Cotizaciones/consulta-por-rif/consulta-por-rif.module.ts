import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConsultaPorRifPageRoutingModule } from './consulta-por-rif-routing.module';

import { ConsultaPorRifPage } from './consulta-por-rif.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ConsultaPorRifPageRoutingModule,
  ],
  declarations: [ConsultaPorRifPage],
  exports: [ConsultaPorRifPage],
})
export class ConsultaPorRifPageModule {}
