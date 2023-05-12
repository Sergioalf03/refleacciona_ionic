import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {  ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SendCodeRecoverPageRoutingModule } from './send-code-recover-routing.module';

import { SendCodeRecoverPage } from './send-code-recover.page';
import { HeaderButtonsModule } from 'src/app/components/header-buttons/header-buttons.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    SendCodeRecoverPageRoutingModule,
    HeaderButtonsModule,
  ],
  declarations: [SendCodeRecoverPage]
})
export class SendCodeRecoverPageModule {}
