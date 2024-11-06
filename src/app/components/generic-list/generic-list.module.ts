import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GenericListComponent } from './generic-list.component';
import { IonicModule } from '@ionic/angular';
import { ProfileHeaderModule } from '../profile-header/profile-header.module';



@NgModule({
  declarations: [GenericListComponent],
  imports: [
    CommonModule,
    IonicModule,
    ProfileHeaderModule,
  ],
  exports: [GenericListComponent],
})
export class GenericListModule { }
