import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';


import { EditRefactorPageRoutingModule } from './edit-refactor-routing.module';
import { EditRefactorPage } from './edit-refactor.page';

import { SharedModule } from '../../../../shared/shared.module';
import { CurrencyMaskModule } from "ng2-currency-mask";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditRefactorPageRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    CurrencyMaskModule
  ],
  exports: [
  EditRefactorPage,   

    //NumberInputComponent
],
  declarations: [EditRefactorPage]
})
export class EditRefactorPageModule { }
