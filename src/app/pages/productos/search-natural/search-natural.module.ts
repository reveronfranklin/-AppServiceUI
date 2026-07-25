import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { SharedModule } from '../../../shared/shared.module';
import { SearchNaturalPageRoutingModule } from './search-natural-routing.module';
import { SearchNaturalPage } from './search-natural.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    CurrencyMaskModule,
    SharedModule,
    SearchNaturalPageRoutingModule,
  ],
  declarations: [SearchNaturalPage],
})
export class SearchNaturalPageModule {}
