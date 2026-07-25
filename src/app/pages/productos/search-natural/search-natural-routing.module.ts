import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SearchNaturalPage } from './search-natural.page';

const routes: Routes = [
  {
    path: '',
    component: SearchNaturalPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SearchNaturalPageRoutingModule {}
