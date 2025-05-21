import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


import { AprobacionEditPage } from './aprobacion-edit.page';

const routes: Routes = [
  {
    path: '',
    component: AprobacionEditPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AprobacionEditPageRoutingModule {}
