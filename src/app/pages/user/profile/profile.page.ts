import { Component, } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Platform, isPlatform } from '@ionic/angular';
import { ConfirmDialogService } from 'src/app/core/controllers/confirm-dialog.service';
import { HttpResponseService } from 'src/app/core/controllers/http-response.service';
import { LoadingService } from 'src/app/core/controllers/loading.service';
import { PhotoService } from 'src/app/core/controllers/photo.service';
import { SessionService } from 'src/app/core/controllers/session.service';
import { ValidFormService } from 'src/app/core/controllers/valid-form.service';
import { Capacitor } from '@capacitor/core';
import { URI_HOME, URI_LOGIN } from 'src/app/core/constants/uris';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage {

  form!: FormGroup;
  backUri = URI_HOME();

  user: any = {};
  txtButtonEnter = 'GUARDAR';
  ImageSrc = '';
  ImageSafeSrc: SafeUrl = '';
  imageData!: any;

  showSaveButton = false;

  formSubmited = false;

  constructor(
    private sessionService: SessionService,
    private photoService: PhotoService,
    private loadingService: LoadingService,
    private confirmDialogService: ConfirmDialogService,
    private httpResponseService: HttpResponseService,
    private validFormService: ValidFormService,
    private router: Router,
    private sanitization: DomSanitizer,
    private platform: Platform,
  ) {
    this.platform
      .backButton
      .subscribeWithPriority(9999, () => {
        this.router.navigateByUrl(this.backUri);
        return;
        // processNextHandler();
      });
  }

  private initForm() {
    this.form = new FormGroup({
      name: new FormControl('', {
        validators: [Validators.required],
      }),
      phoneNumber: new FormControl('', {
        validators: [Validators.required],
      }),
    })
  }

  private setData(data: any) {
    this.form.setValue({
      name: data.userName,
      phoneNumber: data.userPhone,
    });
    this.loadingService.dismissLoading();
  }

  ionViewWillEnter() {
    this.loadingService.showLoading();
    this.initForm();
    this.sessionService
      .getProfileFormData()
      .subscribe({
        next: res => this.setData(res),
        error: err => this.httpResponseService.onError(err, 'No se pudieron recuperar los datos'),
      })


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

  onSubmit() {
    this.formSubmited = true;
    if (this.validFormService.isValid(this.form, [])) {
      this.confirmDialogService.presentAlert('¿Desea guardar los cambios?', () => {
        this.loadingService.showLoading();

        const user = {
          name: this.form.controls['name'].value,
          phone_number: this.form.controls['phoneNumber'].value,
        };

        this.sessionService
          .update(user)
          .subscribe({
            next: async (res: any) => {
              if (this.ImageSrc) {
                const blob = await fetch(this.ImageSrc)
                  .then(r => r.blob())
                  .catch(e => console.log(e));

                this.photoService
                  .saveLocalLogo(this.imageData)
                  .then(file => {
                    this.sessionService
                      .uploadLogo(blob)
                      .subscribe({
                        next: async (res: any) => {
                          this.httpResponseService.onSuccess('Actualización exitosa')
                        },
                        error: err => {
                          this.httpResponseService.onError(err, 'No se pudo guardar la imagen');
                        },
                      });
                  })
                  .catch(e => this.httpResponseService.onError(e, 'No se pudieron actualizar los datos'));
              } else {
                this.httpResponseService.onSuccess('Actualización exitosa')
              }
            },
            error: err => {
              this.httpResponseService.onError(err, 'No se pudieron actualizar los datos');
            },
          });
      });

    }
  }

  onGoingHome() {
    this.router.navigateByUrl(this.backUri);
  }

  onSelectPhoto() {
    this.photoService
      .openGallery()
      .then(async res => {
        this.ImageSafeSrc = this.sanitization.bypassSecurityTrustUrl(res.photos[0].webPath);
        this.ImageSrc = res.photos[0].webPath;
        this.imageData = res.photos[0];
        this.showSaveButton = true;
      })
      .catch(e => console.log(e));
  }

  onLogout() {
    this.confirmDialogService
      .presentAlert('¿Desea cerrar sesión?', async () => {
        this.loadingService.showLoading();
        return await this.sessionService.logout()
          .subscribe({
            next: () => {
              this.router.navigateByUrl(URI_LOGIN())
              this.loadingService.dismissLoading();
            },
            error: err => {
              this.httpResponseService.onError(err, 'Error al cerrar sesión');
            },
          })
      })
  }

}
