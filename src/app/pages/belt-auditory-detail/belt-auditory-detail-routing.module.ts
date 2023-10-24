import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BeltAuditoryDetailPage } from './belt-auditory-detail.page';

const routes: Routes = [
  {
    path: '',
    component: BeltAuditoryDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BeltAuditoryDetailPageRoutingModule {}
