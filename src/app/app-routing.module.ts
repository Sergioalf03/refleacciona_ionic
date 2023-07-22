import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { AutoLoginGuard } from './core/guards/auto-login.guard';
import { URI_AUDITORY_DETAIL, URI_AUDITORY_FINISH_FORM, URI_AUDITORY_FORM, URI_AUDITORY_LIST, URI_EMAIL_CONFIRMATION, URI_HOME, URI_LOGIN, URI_PROFILE, URI_QUESTION_FORM, URI_RECOVER_ACCOUNT, URI_REGISTER, URI_SEND_RECOVER_CODE } from './core/constants/uris';

const routes: Routes = [
  {
    path: '',
    redirectTo: URI_LOGIN(),
    pathMatch: 'full'
  },
  {
    path: URI_LOGIN(),
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule),
    // canActivate: [AutoLoginGuard]
  },
  {
    path: URI_REGISTER(),
    loadChildren: () => import('./pages/register/register.module').then( m => m.RegisterPageModule),
    // canActivate: [AutoLoginGuard]
  },
  {
    path: URI_HOME(),
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule),
    canLoad: [AuthGuard]
  },
  {
    path: URI_RECOVER_ACCOUNT(),
    loadChildren: () => import('./pages/recover-account/recover-account.module').then( m => m.RecoverAccountPageModule),
    // canActivate: [AutoLoginGuard]
  },
  {
    path: URI_SEND_RECOVER_CODE(':withMail'),
    loadChildren: () => import('./pages/send-code-recover/send-code-recover.module').then( m => m.SendCodeRecoverPageModule),
    // canActivate: [AutoLoginGuard]
  },
  {
    path: URI_EMAIL_CONFIRMATION(':withMail'),
    loadChildren: () => import('./pages/email-confirmation/email-confirmation.module').then( m => m.EmailConfirmationPageModule),
    // canActivate: [AutoLoginGuard]
  },
  {
    path: URI_AUDITORY_FORM(':id'),
    loadChildren: () => import('./pages/auditory-form/auditory.module').then( m => m.AuditoryFormPageModule)
  },
  {
    path: URI_AUDITORY_LIST(':origin'),
    loadChildren: () => import('./pages/auditory-list/auditory-list.module').then( m => m.AuditoryListPageModule)
  },
  {
    path: URI_PROFILE(),
    loadChildren: () => import('./pages/profile/profile.module').then( m => m.ProfilePageModule)
  },
  {
    path: URI_QUESTION_FORM(':from', ':auditoryId', ':sectionId'),
    loadChildren: () => import('./pages/question-form/question-form.module').then( m => m.QuestionFormPageModule)
  },
  {
    path: URI_AUDITORY_FINISH_FORM(':from', ':auditoryId'),
    loadChildren: () => import('./pages/auditory-finish-form/auditory-finish-form.module').then( m => m.AuditoryFinishFormPageModule)
  },
  {
    path: URI_AUDITORY_DETAIL(':id'),
    loadChildren: () => import('./pages/auditory-detail/auditory-detail.module').then( m => m.AuditoryDetailPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
