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
    loadChildren: () => import('./pages/registro/registro.module').then( m => m.RegistroPageModule),
    canActivate: [AutoLoginGuard]
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/inicio/inicio.module').then( m => m.InicioPageModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'recover',
    loadChildren: () => import('./pages/recover-account/recover-account.module').then( m => m.RecoverAccountPageModule),
    canActivate: [AutoLoginGuard]
  },
  {
    path: 'code',
    loadChildren: () => import('./pages/send-code-recover/send-code-recover.module').then( m => m.SendCodeRecoverPageModule),
    canActivate: [AutoLoginGuard]
  },
  {
    path: 'change-password',
    loadChildren: () => import('./pages/change-password/change-password.module').then( m => m.ChangePasswordPageModule),
    canActivate: [AutoLoginGuard]
  },
  {
    path: 'email-confirmation',
    loadChildren: () => import('./pages/email-confirmation/email-confirmation.module').then( m => m.EmailConfirmationPageModule),
    canActivate: [AutoLoginGuard]
  }


];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
