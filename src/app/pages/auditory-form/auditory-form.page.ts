import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpResponseService } from 'src/app/core/controllers/http-response.service';
import { PhotoService } from 'src/app/core/controllers/photo.service';
import { ValidFormService } from 'src/app/core/controllers/valid-form.service';
import { AuditoryService } from 'src/app/services/auditory.service';
import { Geolocation } from '@capacitor/geolocation';
import { MapService } from 'src/app/core/controllers/map.service';
import { AuditoryEvidenceService } from 'src/app/services/auditory-evidence.service';
import { ConfirmDialogService } from 'src/app/core/controllers/confirm-dialog.service';
import { DatabaseService } from 'src/app/core/controllers/database.service';
import { AnswerService } from 'src/app/services/answer.service';
import { ActionSheetController, isPlatform } from '@ionic/angular';
import { LoadingService } from 'src/app/core/controllers/loading.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-auditory-form',
  templateUrl: './auditory-form.page.html',
})
export class AuditoryFormPage implements OnInit {

  formActionText = 'Nueva';
  SubmitButtonText = 'Comenzar';
  auditoryId = '0';
  backUrl = '/home';
  locationAdded = false;
  hideMap = true;

  form!: FormGroup;

  ImageSrc: any[] = [];

  constructor(
    private auditoryService: AuditoryService,
    private auditoryEvidenceService: AuditoryEvidenceService,
    private router: Router,
    private route: ActivatedRoute,
    private validFormService: ValidFormService,
    private responseService: HttpResponseService,
    private mapService: MapService,
    private photoService: PhotoService,
    private confirmDialogService: ConfirmDialogService,
    private actionSheetCtrl: ActionSheetController,
    private loadingService: LoadingService,
    private sanitization: DomSanitizer
  ) { }

  private initForm() {
    this.form = new FormGroup({
      title: new FormControl('', {
        validators: [ Validators.required ]
      }),
      description: new FormControl(''),
      date: new FormControl(''),
      time: new FormControl(''),
      lat: new FormControl(''),
      lng: new FormControl(''),
    });
  }

  private async createAuditory(auditory: any) {
    this.auditoryService
      .localSave(auditory)
      .subscribe({
        next: (save) => {
          if (save !== 'waiting') {

            this.auditoryService
              .getLastSavedId()
              .subscribe({
                next: async res => {
                  if (res !== 'waiting') {
                    this.hideMap = true;
                    this.auditoryId = res.values[0].id;

                    let count = 0;

                    if (this.ImageSrc.length > 0) {
                      this.ImageSrc.forEach(async (src: any) => {
                        const blob = await fetch(src.file).then(r => r.blob());

                        this.photoService
                          .saveLocalAuditoryEvidence(blob, this.auditoryId)
                          .then(photoId => {
                            this.auditoryEvidenceService
                              .localSave({ auditoryId: this.auditoryId, dir: photoId })
                              .subscribe({
                                next: async photo => {
                                  if (photo !== 'waiting') {
                                    count++;
                                    if (count === this.ImageSrc.length) {
                                      this.responseService.onSuccessAndRedirect(`/question-form/${this.auditoryId}/1`, 'Auditoría guarda');
                                    }
                                  }
                                },
                                error: err => {
                                  this.responseService.onError(err, 'No se pudo guardar una imagen')
                                },
                              })
                          });
                      });
                    } else {
                      this.responseService.onSuccessAndRedirect(`/question-form/${this.auditoryId}/1`, 'Auditoría guarda');
                    }
                  }

                }
              });
          }
        },
        error: err => {
          this.responseService.onError(err, 'No se pudo guardar')
        },
      })
  }

  private updateAuditory(auditory: any) {
    this.auditoryService
      .updateLocal(this.auditoryId, auditory)
      .subscribe({
        next: (updateRes) => {
          if (updateRes !== 'waiting') {
            this.hideMap = true;
            this.responseService.onSuccessAndRedirect('/auditory-list', 'Auditoría actualizada');
          }
        },
        error: err => {
          this.responseService.onError(err, 'No se pudo actualizar')
        },
      })
  }

  private setAuditory(auditory: any) {
    this.backUrl = 'auditory-list';
    this.form.setValue({
      title: auditory.title,
      description: auditory.description,
      date: auditory.date,
      time: auditory.time,
      lat: auditory.lat,
      lng: auditory.lng,
    });

    this.auditoryEvidenceService
      .getEvidencesByAuditory(this.auditoryId)
      .subscribe({
        next: res => {
          if (res !== 'waiting') {
            console.log(isPlatform('hybrid'))
            if (isPlatform('hybrid')) {
              res.values.forEach(async (row: any) => {
                this.photoService.getLocalAuditoryEvidenceUri(row.dir).then(photo => {
                  this.ImageSrc.push({
                    id: row.dir,
                    file: Capacitor.convertFileSrc(photo.uri),
                    expand: {
                      width: '25%'
                    },
                  });
                })
              });
            } else {
              res.values.forEach(async (row: any) => {
                this.photoService.getLocalAuditoryEvidence(row.dir).then(photo => {
                  this.ImageSrc.push({
                    id: row.dir,
                    file: this.sanitization.bypassSecurityTrustUrl('data:image/jpeg;base64,' + photo.data),
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
      console.log(this.ImageSrc)
    }, 1000)
  }

  ngOnInit(): void {
    this.hideMap = true;
  }

  ionViewWillEnter() {
    this.hideMap = true;
    this.initForm();
    this.route
      .paramMap
      .subscribe({
        next: paramMap => {
          this.hideMap = false;
          let id = paramMap.get('id') || '0';
          if (id === '00') {
            this.backUrl = 'auditory-list';
            id = '0';
          }
          if (id !== '0') {
            this.loadingService.showLoading();
            this.auditoryId = id;
            this.formActionText = 'Actualizando';
            this.SubmitButtonText = 'Guardar';
            this.auditoryService
              .getLocalForm(this.auditoryId)
              .subscribe({
                next: res => {
                  if (res !== 'waiting') {
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
    this.hideMap = true;

    this.form = new FormGroup({});

    this.ImageSrc = [];
    this.hideMap = true;
  }

  onSubmit() {
    // this.responseService.onSuccessAndRedirect(`/question-form/${this.auditoryId}/1`, 'Auditoría guarda');
    // return;
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
    const coordinates = await Geolocation.getCurrentPosition();
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
            file: this.sanitization.bypassSecurityTrustUrl(res.photos[index].webPath),
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
            .saveLocalAuditoryEvidence(blob, this.auditoryId)
            .then(photoId => {
              if (photoId !== 'waiting') {
                this.auditoryEvidenceService
                .localSave({ auditoryId: this.auditoryId, dir: photoId })
                .subscribe({
                  next: async save => {
                    if (save !== 'waiting') {
                        this.auditoryEvidenceService
                          .getLastInsertedDir()
                          .subscribe({
                            next: async (res2: any) => {
                              if (res2 !== 'waiting') {
                                this.ImageSrc.push({
                                  id: res2.values[0].dir,
                                  file: this.sanitization.bypassSecurityTrustUrl(img),
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
            file: this.sanitization.bypassSecurityTrustUrl(res.webPath || ''),
            expand: {
              width: '25%'
            },
          });
      } else {
        const img = res.webPath || '';
        const blob = await fetch(img).then(r => r.blob());

        this.photoService
          .saveLocalAuditoryEvidence(blob, this.auditoryId)
          .then(photoId => {
            if (photoId !== 'waiting') {
              this.auditoryEvidenceService
                .localSave({ auditoryId: this.auditoryId, dir: photoId })
                .subscribe({
                  next: async save => {
                    if (save !== 'waiting') {
                      this.auditoryEvidenceService
                        .getLastInsertedDir()
                        .subscribe({
                          next: async (res2: any) => {
                            if (res2 !== 'waiting') {
                              this.ImageSrc.push({
                                id: res2.values[0].dir,
                                file: this.sanitization.bypassSecurityTrustUrl(img),
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
          text: 'Eliminar Auditoría',
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
        this.auditoryEvidenceService
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
