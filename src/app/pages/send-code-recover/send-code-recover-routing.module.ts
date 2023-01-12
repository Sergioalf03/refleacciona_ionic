import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SendCodeRecoverPage } from './send-code-recover.page';

const routes: Routes = [
  {
    path: '',
    component: SendCodeRecoverPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SendCodeRecoverPageRoutingModule {}
