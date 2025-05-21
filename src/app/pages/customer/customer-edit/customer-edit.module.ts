import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';


import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { CustomerEditPageRoutingModule } from './customer-edit-routing.module';
import { CustomerEditPage } from './customer-edit.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CustomerEditPageRoutingModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [CustomerEditPage]
})
export class CustomerEditPageModule {}
