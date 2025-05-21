import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';


import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { CustomerCreatePageRoutingModule } from './customer-create-routing.module';
import { CustomerCreatePage } from './customer-create.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CustomerCreatePageRoutingModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [CustomerCreatePage]
})
export class CustomerCreatePageModule {}
