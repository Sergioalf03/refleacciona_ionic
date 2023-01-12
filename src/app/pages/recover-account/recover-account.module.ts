import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RecoverAccountPageRoutingModule } from './recover-account-routing.module';

import { RecoverAccountPage } from './recover-account.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RecoverAccountPageRoutingModule
  ],
  declarations: [RecoverAccountPage]
})
export class RecoverAccountPageModule {}
