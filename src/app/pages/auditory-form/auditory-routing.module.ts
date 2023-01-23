import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuditoryFormPage } from './auditory-form.page';

const routes: Routes = [
  {
    path: '',
    component: AuditoryFormPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuditoryFormPageRoutingModule {}
