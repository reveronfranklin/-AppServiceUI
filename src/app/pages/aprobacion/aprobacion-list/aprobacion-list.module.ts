import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AprobacionListPageRoutingModule } from './aprobacion-list-routing.module';

import { AprobacionListPage } from './aprobacion-list.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AprobacionListPageRoutingModule
  ],
  declarations: [AprobacionListPage]
})
export class AprobacionListPageModule {}
