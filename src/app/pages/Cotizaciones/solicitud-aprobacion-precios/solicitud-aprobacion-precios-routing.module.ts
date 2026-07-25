import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SolicitudAprobacionPreciosPage } from './solicitud-aprobacion-precios.page';

const routes: Routes = [
  {
    path: '',
    component: SolicitudAprobacionPreciosPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SolicitudAprobacionPreciosPageRoutingModule {}
