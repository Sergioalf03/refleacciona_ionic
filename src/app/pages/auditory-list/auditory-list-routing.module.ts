import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuditoryListPage } from './auditory-list.page';

const routes: Routes = [
  {
    path: '',
    component: AuditoryListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuditoryListPageRoutingModule {}
