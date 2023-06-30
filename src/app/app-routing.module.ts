import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { AutoLoginGuard } from './core/guards/auto-login.guard';

const routes: Routes = [

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule),
    // canActivate: [AutoLoginGuard]
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/register/register.module').then( m => m.RegisterPageModule),
    // canActivate: [AutoLoginGuard]
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'recover',
    loadChildren: () => import('./pages/recover-account/recover-account.module').then( m => m.RecoverAccountPageModule),
    // canActivate: [AutoLoginGuard]
  },
  {
    path: 'code/:withMail',
    loadChildren: () => import('./pages/send-code-recover/send-code-recover.module').then( m => m.SendCodeRecoverPageModule),
    // canActivate: [AutoLoginGuard]
  },
  {
    path: 'change-password',
    loadChildren: () => import('./pages/change-password/change-password.module').then( m => m.ChangePasswordPageModule),
    // canActivate: [AutoLoginGuard]
  },
  {
    path: 'email-confirmation/:withMail',
    loadChildren: () => import('./pages/email-confirmation/email-confirmation.module').then( m => m.EmailConfirmationPageModule),
    // canActivate: [AutoLoginGuard]
  },
  {
    path: 'auditory-form/:id',
    loadChildren: () => import('./pages/auditory-form/auditory.module').then( m => m.AuditoryFormPageModule)
  },
  {
    path: 'auditory-list',
    loadChildren: () => import('./pages/auditory-list/auditory-list.module').then( m => m.AuditoryListPageModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./pages/profile/profile.module').then( m => m.ProfilePageModule)
  },
  {
    path: 'question-form/:auditoryId/:sectionId',
    loadChildren: () => import('./pages/question-form/question-form.module').then( m => m.QuestionFormPageModule)
  },
  {
    path: 'auditory-finish-form/:auditoryId',
    loadChildren: () => import('./pages/auditory-finish-form/auditory-finish-form.module').then( m => m.AuditoryFinishFormPageModule)
  },


];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
