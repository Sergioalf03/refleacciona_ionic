import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmDialogService } from 'src/app/core/controllers/confirm-dialog.service';
import { HttpResponseService } from 'src/app/core/controllers/http-response.service';
import { LoadingService } from 'src/app/core/controllers/loading.service';
import { PhotoService } from 'src/app/core/controllers/photo.service';
import { SessionService } from 'src/app/core/controllers/session.service';
import { ToastService } from 'src/app/core/controllers/toast.service';
import { ValidFormService } from 'src/app/core/controllers/valid-form.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
})
export class ProfilePage {

  form!: FormGroup;

  user: any = {};
  txtButtonEnter = 'GUARDAR';
  ImageSrc = '';

  constructor(
    private sessionService: SessionService,
    private toastService: ToastService,
    private photoService: PhotoService,
    private loadingService: LoadingService,
    private confirmDialogService: ConfirmDialogService,
    private httpResponseService: HttpResponseService,
    private validFormService: ValidFormService,
    private router: Router,
  ) {}

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

    this.photoService.getLocalLogo().then(photo => {
      this.ImageSrc = 'data:image/jpeg;base64,' + photo.data;
    });
  }

  onSubmit() {
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
                const blob = await fetch(this.ImageSrc).then(r => r.blob());
                this.sessionService
                  .uploadLogo(blob)
                  .subscribe({
                    next: async (res: any) => {
                      this.photoService.saveLocalLogo(blob);
                      this.httpResponseService.onSuccess('Actualización exitosa')
                    },
                    error: err => {
                      this.httpResponseService.onError(err, 'No se pudo guardar la imagen');
                    },
                })
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
    this.router.navigateByUrl('/home');
  }

  onSelectPhoto() {
    this.photoService.openGallery().then(async res => {
      this.ImageSrc = res.photos[0].webPath;

    });
  }

}
