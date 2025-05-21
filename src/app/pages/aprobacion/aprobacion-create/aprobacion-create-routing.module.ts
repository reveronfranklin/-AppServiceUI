import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AprobacionCreatePage } from './aprobacion-create.page';



const routes: Routes = [
  {
    path: '',
    component: AprobacionCreatePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AprobacionCreatePageRoutingModule {}
