import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditRefactorPage } from './edit-refactor.page';

const routes: Routes = [
  {
    path: '',
    component: EditRefactorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditRefactorPageRoutingModule {}
