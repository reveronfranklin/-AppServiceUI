import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EspecificacionesPage } from './especificaciones.page';

const routes: Routes = [
  {
    path: '',
    component: EspecificacionesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EspecificacionesPageRoutingModule {}
