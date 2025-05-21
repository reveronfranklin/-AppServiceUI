import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CustomerEditPage } from './customer-edit.page';

const routes: Routes = [
  {
    path: '',
    component: CustomerEditPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomerEditPageRoutingModule {}
