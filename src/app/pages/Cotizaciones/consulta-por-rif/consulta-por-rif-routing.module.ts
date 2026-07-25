import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConsultaPorRifPage } from './consulta-por-rif.page';

const routes: Routes = [
  {
    path: '',
    component: ConsultaPorRifPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConsultaPorRifPageRoutingModule {}
