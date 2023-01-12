import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SendCodeRecoverPageRoutingModule } from './send-code-recover-routing.module';

import { SendCodeRecoverPage } from './send-code-recover.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SendCodeRecoverPageRoutingModule
  ],
  declarations: [SendCodeRecoverPage]
})
export class SendCodeRecoverPageModule {}
