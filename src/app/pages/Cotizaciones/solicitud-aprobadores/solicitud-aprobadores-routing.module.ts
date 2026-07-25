import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SolicitudAprobadoresPage } from './solicitud-aprobadores.page';

const routes: Routes = [
  {
    path: '',
    component: SolicitudAprobadoresPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SolicitudAprobadoresPageRoutingModule {}
