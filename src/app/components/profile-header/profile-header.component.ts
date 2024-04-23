import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { isPlatform } from '@ionic/angular';
import { URI_LOGIN, URI_PROFILE } from 'src/app/core/constants/uris';
import { ConfirmDialogService } from 'src/app/core/controllers/confirm-dialog.service';
import { HttpResponseService } from 'src/app/core/controllers/http-response.service';
import { LoadingService } from 'src/app/core/controllers/loading.service';
import { PhotoService } from 'src/app/core/controllers/photo.service';
import { SessionService } from 'src/app/core/controllers/session.service';

@Component({
  selector: 'app-profile-header',
  templateUrl: './profile-header.component.html',
  styleUrls: ['./profile-header.component.scss'],
})
export class ProfileHeaderComponent implements OnInit {

  userName = 'Sara J.';
  ImageSafeSrc = '';

  constructor(
    private confirmDialogService: ConfirmDialogService,
    private loadingService: LoadingService,
    private sessionService: SessionService,
    private router: Router,
    private httpResponseService: HttpResponseService,
    private photoService: PhotoService,
  ) { }

  ngOnInit() {
    const homeUserData = this.sessionService.getUserHomeData();

    const whereToSlice = homeUserData.userName.indexOf(' ');
    let replacedName = homeUserData.userName.substring(0, whereToSlice + 2) + '.';

    if (replacedName.length > 15) {
      replacedName = replacedName.substring(0, 15) + '...';
    }

    this.userName = replacedName;

    if (isPlatform('hybrid')) {
      this.photoService
        .getLocalLogoUri()
        .then(photo => {
          this.ImageSafeSrc = Capacitor.convertFileSrc(photo.uri)
        })
        .catch(e => console.log(e));
    } else {
      this.photoService
        .getLocalLogo()
        .then(photo => {
          if (!!photo) {
            this.ImageSafeSrc = 'data:image/png;base64,' + photo.data;
          }
        })
        .catch(e => console.log(e));
    }
  }

  onLogout() {
    this.confirmDialogService
      .presentAlert('¿Desea cerrar sesión?', async () => {
        this.loadingService.showLoading();
        return await this.sessionService
          .logout()
          .subscribe({
            next: () => {
              this.router.navigateByUrl(URI_LOGIN());
              this.loadingService.dismissLoading();
            },
            error: err => {
              this.httpResponseService.onError(err, 'Error al cerrar sesión');
            },
          });
      });
  }

  onOpenUser() {
    this.router.navigateByUrl(URI_PROFILE());
  }

}
