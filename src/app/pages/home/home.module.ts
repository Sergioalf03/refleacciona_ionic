import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomePage } from './home.page';
import { RouterModule, Routes } from '@angular/router';
import { ProfileHeaderModule } from 'src/app/components/profile-header/profile-header.module';

const routes: Routes = [
  {
    path: '',
    component: HomePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    ProfileHeaderModule,
  ],
  declarations: [HomePage]
})
export class HomePageModule {}
