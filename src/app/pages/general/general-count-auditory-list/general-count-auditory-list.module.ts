import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { GeneralCountAuditoryListPage } from './general-count-auditory-list.page';
import { RouterModule, Routes } from '@angular/router';
import { HeaderButtonsModule } from 'src/app/components/header-buttons/header-buttons.module';

const routes: Routes = [
  {
    path: '',
    component: GeneralCountAuditoryListPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild(routes),
    HeaderButtonsModule,
  ],
  declarations: [GeneralCountAuditoryListPage]
})
export class GeneralCountAuditoryListPageModule {}
