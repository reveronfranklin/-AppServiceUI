import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AprobacionListPage } from './aprobacion-list.page';

const routes: Routes = [
  {
    path: '',
    component: AprobacionListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AprobacionListPageRoutingModule {}
