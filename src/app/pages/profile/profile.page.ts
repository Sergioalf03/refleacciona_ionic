import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpResponseService } from 'src/app/core/controllers/http-response.service';
import { PhotoService } from 'src/app/core/controllers/photo.service';
import { SessionService } from 'src/app/core/controllers/session.service';
import { ToastService } from 'src/app/core/controllers/toast.service';
import { ValidFormService } from 'src/app/core/controllers/valid-form.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
})
export class ProfilePage implements OnInit {

  form!: FormGroup;

  user: any = {};
  txtButtonEnter = 'GUARDAR';
  ImageSrc = '';
  btnLoading: boolean = false;

  constructor(
    private sessionService: SessionService,
    private toastService: ToastService,
    private photoService: PhotoService,
    private httpResponseService: HttpResponseService,
    private validFormService: ValidFormService,
    private router: Router,
  ) {
    this.btnLoading = false;
  }

  private initForm() {
    this.form = new FormGroup({
      name: new FormControl('', {
        validators: [Validators.required],
      }),
      phoneNumber: new FormControl('', {
        validators: [Validators.required],
      }),
      email: new FormControl('', {
        validators: [Validators.required],
      }),
    })
  }

  ngOnInit() {
  }

  private setData(data: any) {
    this.form.setValue({
      name: data.userName,
      phoneNumber: data.userPhone,
      email: data.userEmail,
    });
  }

  ionViewWillEnter() {
    this.initForm();
    this.sessionService
      .getProfileFormData()
      .subscribe({
        next: res => this.setData(res),
        error: err => this.httpResponseService.onError(err, 'No se pudieron recuperar los datos'),
      })

    this.photoService.getLocalLogo().then(photo => {
      this.ImageSrc = 'data:image/jpeg;base64,' + photo.data;
      console.log(photo);
    });;
  }

  onSubmit() {
    if (this.validFormService.isValid(this.form, [])) {
      this.btnLoading = true;

      const user = {
        name: this.form.controls['name'].value,
        email: this.form.controls['email'].value,
        phone_number: this.form.controls['phoneNumber'].value,
      };

      this.sessionService
        .update(user)
        .subscribe({
          next: async (res: any) => {
            this.toastService.showSuccessToast('Guardado exitoso')
            if (this.ImageSrc) {
              const blob = await fetch(this.ImageSrc).then(r => r.blob());
              console.log(blob)
              this.sessionService
                .uploadLogo(blob)
                .subscribe({
                  next: async (res: any) => {
                    this.photoService.saveLocalLogo(blob);
                    this.toastService.showSuccessToast('Guardado exitoso')
                  },
                  error: err => {
                    this.httpResponseService.onError(err, '');
                  },
              })
            }
          },
          error: err => {
            this.httpResponseService.onError(err, '');
            this.resetForm();
          },
        });
    }
  }

  resetForm() {
    this.form.reset();
    this.btnLoading = false;
  }

  onGoingHome() {
    this.router.navigateByUrl('/home');
  }

  onSelectPhoto() {
    let text = '';
    this.photoService.openGallery(text).then(async res => {
      console.log(res)
      this.ImageSrc = res.photos[0].webPath;

    });
  }

}
