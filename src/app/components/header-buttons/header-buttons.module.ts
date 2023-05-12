import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderButtonsComponent } from './header-buttons.component';
import { IonicModule } from '@ionic/angular';



@NgModule({
  declarations: [HeaderButtonsComponent],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [HeaderButtonsComponent],
})
export class HeaderButtonsModule { }
