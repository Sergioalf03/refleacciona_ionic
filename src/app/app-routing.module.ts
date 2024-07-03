import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { URI_AUDITORY_DETAIL, URI_AUDITORY_FORM, URI_AUDITORY_LIST, URI_BELT_COUNT_FORM, URI_BELT_DETAIL, URI_BELT_FORM, URI_BELT_LIST, URI_EMAIL_CONFIRMATION, URI_GENERAL_COUNT_COUNT_FORM, URI_GENERAL_COUNT_DETAIL, URI_GENERAL_COUNT_FORM, URI_GENERAL_COUNT_LIST, URI_HELMET_COUNT_FORM, URI_HELMET_DETAIL, URI_HELMET_FORM, URI_HELMET_LIST, URI_HOME, URI_LOGIN, URI_PROFILE, URI_QUESTION_FORM, URI_RECOVER_ACCOUNT, URI_REGISTER, URI_SEND_RECOVER_CODE } from './core/constants/uris';

const routes: Routes = [
  {
    path: '',
    redirectTo: URI_HOME(),
    pathMatch: 'full'
  },
  {
    path: URI_LOGIN(),
    loadChildren: () => import('./pages/user/login/login.module').then( m => m.LoginPageModule),
  },
  {
    path: URI_REGISTER(),
    loadChildren: () => import('./pages/user/register/register.module').then( m => m.RegisterPageModule),
  },
  {
    path: URI_HOME(),
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule),
    canLoad: [AuthGuard]
  },
  {
    path: URI_RECOVER_ACCOUNT(),
    loadChildren: () => import('./pages/user/recover-account/recover-account.module').then( m => m.RecoverAccountPageModule),
  },
  {
    path: URI_SEND_RECOVER_CODE(':withMail'),
    loadChildren: () => import('./pages/user/send-code-recover/send-code-recover.module').then( m => m.SendCodeRecoverPageModule),
  },
  {
    path: URI_EMAIL_CONFIRMATION(':withMail'),
    loadChildren: () => import('./pages/user/email-confirmation/email-confirmation.module').then( m => m.EmailConfirmationPageModule),
  },
  {
    path: URI_AUDITORY_FORM(':id'),
    loadChildren: () => import('./pages/auditory/auditory-form/auditory.module').then( m => m.AuditoryFormPageModule)
  },
  {
    path: URI_AUDITORY_LIST(':origin'),
    loadChildren: () => import('./pages/auditory/auditory-list/auditory-list.module').then( m => m.AuditoryListPageModule)
  },
  {
    path: URI_PROFILE(),
    loadChildren: () => import('./pages/user/profile/profile.module').then( m => m.ProfilePageModule)
  },
  {
    path: URI_QUESTION_FORM(':auditoryId',),
    loadChildren: () => import('./pages/auditory/question-form/question-form.module').then( m => m.QuestionFormPageModule)
  },

  {
    path: URI_AUDITORY_DETAIL(':id'),
    loadChildren: () => import('./pages/auditory/auditory-detail/auditory-detail.module').then( m => m.AuditoryDetailPageModule)
  },
  {
    path: URI_HELMET_FORM(':id'),
    loadChildren: () => import('./pages/helmet/helmet-initial-form/helmet-initial-form.module').then( m => m.HelmetInitialFormPageModule)
  },
  // {
  //   path: URI_HELMET_COLLECION_DETAIL(':from' ,':id'),
  //   loadChildren: () => import('./pages/helmet-collection-data/helmet-collection-data.module').then( m => m.HelmetCollectionDataPageModule)
  // },
  {
    path: URI_HELMET_COUNT_FORM(':id'),
    loadChildren: () => import('./pages/helmet/helmet-count-form/helmet-count-form.module').then( m => m.HelmetCountFormPageModule)
  },
  {
    path: URI_HELMET_LIST(':origin'),
    loadChildren: () => import('./pages/helmet/helmet-auditory-list/helmet-auditory-list.module').then( m => m.HelmetAuditoryListPageModule)
  },
  {
    path: URI_HELMET_DETAIL(':id'),
    loadChildren: () => import('./pages/helmet/helmet-auditory-detail/helmet-auditory-detail.module').then( m => m.HelmetAuditoryDetailPageModule)
  },
  {
    path: URI_BELT_FORM(':id'),
    loadChildren: () => import('./pages/belt/belt-initial-form/belt-initial-form.module').then( m => m.BeltInitialFormPageModule)
  },
  {
    path: URI_BELT_COUNT_FORM(':id'),
    loadChildren: () => import('./pages/belt/belt-count-form/belt-count-form.module').then( m => m.BeltCountFormPageModule)
  },
  {
    path: URI_BELT_DETAIL(':id'),
    loadChildren: () => import('./pages/belt/belt-auditory-detail/belt-auditory-detail.module').then( m => m.BeltAuditoryDetailPageModule)
  },
  {
    path: URI_BELT_LIST(':origin'),
    loadChildren: () => import('./pages/belt/belt-auditory-list/belt-auditory-list.module').then( m => m.BeltAuditoryListPageModule)
  },
  {
    path: URI_GENERAL_COUNT_LIST(':origin'),
    loadChildren: () => import('./pages/general/general-count-auditory-list/general-count-auditory-list.module').then( m => m.GeneralCountAuditoryListPageModule)
  },
  {
    path: URI_GENERAL_COUNT_FORM(':id'),
    loadChildren: () => import('./pages/general/general-count-auditory-form/general-count-auditory-form.module').then( m => m.GeneralCountAuditoryFormPageModule)
  },
  {
    path: URI_GENERAL_COUNT_DETAIL(':id'),
    loadChildren: () => import('./pages/general/general-count-auditory-detail/general-count-auditory-detail.module').then( m => m.GeneralCountAuditoryDetailPageModule)
  },
  {
    path: URI_GENERAL_COUNT_COUNT_FORM(':id'),
    loadChildren: () => import('./pages/general/swipe-form/swipe-form.module').then( m => m.SwipeFormPageModule)
  },
  {
    path: 'generic-initial-form',
    loadChildren: () => import('./components/generic-initial-form/generic-initial-form.module').then( m => m.GenericInitialFormPageModule)
  },


];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
