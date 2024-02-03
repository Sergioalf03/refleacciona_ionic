import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { ActionSheetController, isPlatform } from '@ionic/angular';
import { DATABASE_WAITING_MESSAGE } from 'src/app/core/constants/message-code';
import { URI_GENERAL_COUNT_COUNT_FORM, URI_GENERAL_COUNT_LIST, URI_HOME } from 'src/app/core/constants/uris';
import { ConfirmDialogService } from 'src/app/core/controllers/confirm-dialog.service';
import { HttpResponseService } from 'src/app/core/controllers/http-response.service';
import { LoadingService } from 'src/app/core/controllers/loading.service';
import { MapService } from 'src/app/core/controllers/map.service';
import { PhotoService } from 'src/app/core/controllers/photo.service';
import { ValidFormService } from 'src/app/core/controllers/valid-form.service';
import { GeneralCountAuditoryEvidenceService } from 'src/app/services/general-count-auditory-evidence.service';
import { GeneralCountAuditoryService } from 'src/app/services/general-count-auditory.service';

@Component({
  selector: 'app-general-count-auditory-form',
  templateUrl: './general-count-auditory-form.page.html',
})
export class GeneralCountAuditoryFormPage implements OnInit {

  formActionText = 'Nuevo';
  SubmitButtonText = 'Comenzar';
  auditoryId = '0';
  backUrl = URI_HOME();
  locationAdded = false;
  hideMap = true;

  form!: FormGroup;

  ImageSrc: any[] = [];

  constructor(
    private generalCountAuditoryService: GeneralCountAuditoryService,
    private generalCountAuditoryEvidenceService: GeneralCountAuditoryEvidenceService,
    private router: Router,
    private route: ActivatedRoute,
    private validFormService: ValidFormService,
    private responseService: HttpResponseService,
    private mapService: MapService,
    private photoService: PhotoService,
    private confirmDialogService: ConfirmDialogService,
    private actionSheetCtrl: ActionSheetController,
    private loadingService: LoadingService,
    private sanitization: DomSanitizer,
  ) { }


  private initForm() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    now.setSeconds(0);

    const splitedDate = now.toISOString().split('T');

    const splitedTime = splitedDate[1].split('.');

    this.form = new FormGroup({
      title: new FormControl('', {
        validators: [Validators.required]
      }),
      description: new FormControl(''),
      date: new FormControl(splitedDate[0], {
        validators: [Validators.required, Validators.minLength(1)]
      }),
      time: new FormControl(splitedTime[0], {
        validators: [Validators.required, Validators.minLength(1)]
      }),
      lat: new FormControl(''),
      lng: new FormControl(''),
    });
  }

  private async createAuditory(auditory: any) {
    this.generalCountAuditoryService
      .localSave(auditory)
      .subscribe({
        next: (save) => {
          if (save !== DATABASE_WAITING_MESSAGE) {

            setTimeout(() => {
              this.generalCountAuditoryService
                .getLastSavedId()
                .subscribe({
                  next: async res => {
                    if (res !== DATABASE_WAITING_MESSAGE) {

                      setTimeout(() => {
                        this.hideMap = true;
                        this.auditoryId = res.values[0].id;

                        let count = 0;

                        if (this.ImageSrc.length > 0) {
                          console.log(this.ImageSrc);
                          this.ImageSrc.forEach(async (src: any, index: number) => {

                              const blob = await fetch(src.base64).then(r => r.blob());

                              this.photoService
                                .saveLocalGeneralCountAuditoryEvidence(blob, this.auditoryId)
                                .then(photoId => {

                                  setTimeout(async () => {
                                    this.generalCountAuditoryEvidenceService
                                      .localSave({ auditoryId: this.auditoryId, dir: photoId })
                                      .subscribe({
                                        next: async photo => {
                                          if (photo !== DATABASE_WAITING_MESSAGE) {
                                            count++;
                                            if (count === this.ImageSrc.length) {
                                              this.responseService.onSuccessAndRedirect(URI_GENERAL_COUNT_COUNT_FORM(this.auditoryId), 'Levantmiento guardado');
                                            }
                                          }
                                        },
                                        error: err => {
                                          this.responseService.onError(err, 'No se pudo guardar una imagen')
                                        },
                                      });
                                  }, 100 * index);
                                })
                                .catch(err => this.responseService.onError(err, 'No se pudo guardar la imagen'));

                          });
                        } else {
                          this.responseService.onSuccessAndRedirect(URI_GENERAL_COUNT_COUNT_FORM(this.auditoryId), 'Levantmiento guardado');
                        }
                      }, 20)
                    }

                  }
                });
            }, 20)
          }
        },
        error: err => {
          this.responseService.onError(err, 'No se pudo guardar')
        },
      })
  }

  private updateAuditory(auditory: any) {
    this.generalCountAuditoryService
      .updateLocal(this.auditoryId, auditory)
      .subscribe({
        next: (updateRes) => {
          if (updateRes !== DATABASE_WAITING_MESSAGE) {
            this.hideMap = true;
            this.responseService.onSuccessAndRedirect(URI_GENERAL_COUNT_LIST('local'), 'Registro actualizado');
          }
        },
        error: err => {
          this.responseService.onError(err, 'No se pudo actualizar')
        },
      })

  }

  private setAuditory(auditory: any) {
    this.backUrl = URI_GENERAL_COUNT_LIST('local');
    this.form.setValue({
      title: auditory.title,
      description: auditory.description,
      date: auditory.date,
      time: auditory.time,
      lat: auditory.lat,
      lng: auditory.lng,
    });

    this.generalCountAuditoryEvidenceService
      .getEvidencesByAuditory(this.auditoryId)
      .subscribe({
        next: res => {
          if (res !== DATABASE_WAITING_MESSAGE) {
            if (isPlatform('hybrid')) {
              res.values.forEach(async (row: any) => {
                this.photoService.getLocalAuditoryEvidenceUri(row.dir).then(photo => {
                  this.ImageSrc.push({
                    id: row.dir,
                    url: Capacitor.convertFileSrc(photo.uri),
                    base64: '',
                    expand: {
                      width: '25%'
                    },
                  });
                })
              });
            } else {
              res.values.forEach(async (row: any) => {
                this.photoService.getLocalAuditoryEvidence(row.dir).then(photo => {
                  const file = 'data:image/png;base64,' + photo.data;
                  this.ImageSrc.push({
                    id: row.dir,
                    url: file,
                    base64: file,
                    expand: {
                      width: '25%'
                    },
                  });
                })
              });
            }
          }
        }
      });

    setTimeout(() => {
      this.mapService.setCenter(auditory.lat, auditory.lng);
      this.loadingService.dismissLoading();
    }, 1000)
  }

  ngOnInit(): void {
    this.hideMap = true;
  }

  ionViewWillEnter() {
    // this.mapService.removeMap();
    this.initForm();
    this.route
      .paramMap
      .subscribe({
        next: paramMap => {
          // this.hideMap = false;
          let id = paramMap.get('id') || '0';
          if (id === '00') {
            this.backUrl = URI_GENERAL_COUNT_LIST('local');
            id = '0';
          }
          if (id !== '0') {
            this.loadingService.showLoading();
            this.auditoryId = id;
            this.formActionText = 'Actualizando';
            this.SubmitButtonText = 'Guardar';
            this.generalCountAuditoryService
              .getLocalForm(this.auditoryId)
              .subscribe({
                next: res => {
                  if (res !== DATABASE_WAITING_MESSAGE) {
                    this.setAuditory(res.values[0]);
                  }
                },
                error: err => {
                  this.responseService.onError(err, 'No se pudieron recuperar los datos');
                },
              })
          }
        }
      }).unsubscribe();
  }

  ionViewWillLeave() {
    this.formActionText = 'Nueva';
    this.SubmitButtonText = 'Comenzar';
    this.auditoryId = '0';

    this.locationAdded = false;

    this.form = new FormGroup({});

    this.ImageSrc = [];
    this.hideMap = true;


  }

  onSubmit() {
    if (this.validFormService.isValid(this.form, [])) {
      this.confirmDialogService
        .presentAlert('¿Desea guardar los cambios?', () => {
          this.loadingService.showLoading();

          this.mapService.setCenter(0, 0);
          const auditory = {
            title: this.form.controls['title'].value,
            description: this.form.controls['description'].value,
            date: this.form.controls['date'].value,
            time: this.form.controls['time'].value,
            lat: this.form.controls['lat'].value,
            lng: this.form.controls['lng'].value,
          };

          if (this.auditoryId === '0') {
            this.createAuditory(auditory);
          } else {
            this.updateAuditory(auditory);
          }
        })
    }
  }


  async onAddLocation() {
    this.hideMap = false;
    const coordinates = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
    this.mapService.setCenter(coordinates.coords.latitude, coordinates.coords.longitude);
  }

  onCancel() {
    this.router.navigateByUrl(this.backUrl);
  }

  async onAddPhoto() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Opciones',
      mode: 'ios',
      buttons: [
        {
          text: 'Cámara',
          handler: () => this.fromCamera(),
        },
        {
          text: 'Galería',
          handler: () => this.fromGallery(),
        },
        {
          text: 'Cerrar',
          role: 'cancel',
          data: {
            action: 'cancel',
          },
        },
      ],
    });

    await actionSheet.present();

  }

  fromGallery() {
    this.photoService.openGallery().then(async res => {
      if (this.auditoryId === '0') {
        for (let index = 0; index < res.photos.length; index++) {
          this.ImageSrc.push({
            id: '',
            url: this.sanitization.bypassSecurityTrustUrl(res.photos[index].webPath),
            base64: res.photos[index].webPath,
            expand: {
              width: '25%'
            },
          });
        }
      } else {
        for (let index = 0; index < res.photos.length; index++) {
          const img = res.photos[index].webPath;
          const blob = await fetch(img).then(r => r.blob());

          this.photoService
            .saveLocalGeneralCountAuditoryEvidence(blob, this.auditoryId)
            .then(photoId => {
              if (photoId !== DATABASE_WAITING_MESSAGE) {
                this.generalCountAuditoryEvidenceService
                  .localSave({ auditoryId: this.auditoryId, dir: photoId })
                  .subscribe({
                    next: async save => {
                      if (save !== DATABASE_WAITING_MESSAGE) {
                        this.generalCountAuditoryEvidenceService
                          .getLastInsertedDir()
                          .subscribe({
                            next: async (res2: any) => {
                              if (res2 !== DATABASE_WAITING_MESSAGE) {
                                this.ImageSrc.push({
                                  id: res2.values[0].dir,
                                  url: this.sanitization.bypassSecurityTrustUrl(img),
                                  base64: img,
                                  expand: {
                                    width: '25%'
                                  },
                                });
                              }
                            }
                          });
                      }
                    },
                    error: err => {
                      this.responseService.onError(err, 'No se pudo guardar una imagen')
                    },
                  })
              }
            });
        }
      }
    });
  }

  fromCamera() {
    this.photoService.takePicture().then(async res => {
      if (this.auditoryId === '0') {
        this.ImageSrc.push({
          id: '',
          url: this.sanitization.bypassSecurityTrustUrl(res.webPath || ''),
          base64: res.webPath || '',
          expand: {
            width: '25%'
          },
        });
      } else {
        const img = res.webPath || '';
        const blob = await fetch(img).then(r => r.blob());

        this.photoService
          .saveLocalGeneralCountAuditoryEvidence(blob, this.auditoryId)
          .then(photoId => {
            if (photoId !== DATABASE_WAITING_MESSAGE) {
              this.generalCountAuditoryEvidenceService
                .localSave({ auditoryId: this.auditoryId, dir: photoId })
                .subscribe({
                  next: async save => {
                    if (save !== DATABASE_WAITING_MESSAGE) {
                      this.generalCountAuditoryEvidenceService
                        .getLastInsertedDir()
                        .subscribe({
                          next: async (res2: any) => {
                            if (res2 !== DATABASE_WAITING_MESSAGE) {
                              this.ImageSrc.push({
                                id: res2.values[0].dir,
                                url: this.sanitization.bypassSecurityTrustUrl(img),
                                base64: img,
                                expand: {
                                  width: '25%'
                                },
                              });
                            }
                          }
                        });
                    }
                  },
                  error: err => {
                    this.responseService.onError(err, 'No se pudo guardar una imagen')
                  },
                });
            }
          });

      }
    });
  }

  onSetCoords(coords: any) {
    this.form.controls['lat'].setValue(coords.lat);
    this.form.controls['lng'].setValue(coords.lng);
  }

  async onImgClicked(dir: string, index: number) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Opciones',
      mode: 'ios',
      buttons: [
        {
          text: 'Cambiar tamaño',
          handler: () => this.onChangeSize(index),
        },
        {
          text: 'Eliminar Foto',
          role: 'destructive',
          handler: () => this.onRemove(dir, index),
        },
        {
          text: 'Cerrar',
          role: 'cancel',
          data: {
            action: 'cancel',
          },
        },
      ],
    });

    await actionSheet.present();
  }

  onChangeSize(index: number) {
    this.ImageSrc[index].expand = this.ImageSrc[index].expand.width === '25%' ? { width: '100%' } : { width: '25%' };
  }

  onRemove(dir: string, index: number) {
    this.confirmDialogService.presentAlert('¿Desea eliminar la imagen?', () => {
      if (!!dir) {
        this.generalCountAuditoryEvidenceService
          .localRemove(dir)
          .subscribe({
            next: () => {
              this.photoService
                .removeLocalAuditoryEvidence(dir)
                .then(() => this.ImageSrc.splice(index, 1));
            }
          })
      } else {
        this.ImageSrc.splice(index, 1);
      }
    });
  }


}
