import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileHeaderComponent } from './profile-header.component';
import { IonicModule } from '@ionic/angular';



@NgModule({
  declarations: [ProfileHeaderComponent],
  imports: [
    CommonModule,
    IonicModule,
  ],
  exports: [ProfileHeaderComponent],
})
export class ProfileHeaderModule { }
