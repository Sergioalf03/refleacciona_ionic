import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Geolocation } from '@capacitor/geolocation';
import { URI_HOME } from 'src/app/core/constants/uris';
import { ConfirmDialogService } from 'src/app/core/controllers/confirm-dialog.service';
import { LoadingService } from 'src/app/core/controllers/loading.service';
import { MapService } from 'src/app/core/controllers/map.service';
import { ValidFormService } from 'src/app/core/controllers/valid-form.service';

@Component({
  selector: 'app-generic-initial-form',
  templateUrl: './generic-initial-form.page.html',
  styleUrls: ['./generic-initial-form.page.scss'],
})
export class GenericInitialFormPage implements OnInit {

  @Input() toFormUrl!: any;
  @Input() toListUrl!: any;
  @Input() functions!: any;

  formActionText = 'Nuevo';
  SubmitButtonText = 'Comenzar';
  auditoryId = '0';
  backUrl = URI_HOME();
  locationAdded = false;
  hideMap = true;
  type = 0;

  formSubmited = false;
  coordsAccepted = false;

  form!: FormGroup;

  ImageSrc: any[] = [];


  constructor(
    private mapService: MapService,
    private loadingService: LoadingService,
    private validFormService: ValidFormService,
    private confirmDialogService: ConfirmDialogService,
    private router: Router,
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
      location: new FormControl('', {
        validators: [Validators.required]
      }),
      lat: new FormControl(''),
      lng: new FormControl(''),
    });
  }

  private createAuditory(data: any) {
    console.log(this.functions.create);
    this.functions.create(data);
  }

  private updateAuditory(auditory: any) {
    // this.service
    //   .updateLocal(this.auditoryId, auditory)
    //   .subscribe({
    //     next: (updateRes: any) => {
    //       if (updateRes !== DATABASE_WAITING_MESSAGE) {
    //         this.hideMap = true;
    //         this.responseService.onSuccessAndRedirect(this.toListUrl('local'), 'Registro actualizado');
    //       }
    //     },
    //     error: (err: any) => {
    //       this.responseService.onError(err, 'No se pudo actualizar')
    //     },
    //   })

  }

  // private setAuditory(auditory: any) {
  //   this.backUrl = this.toListUrl('local');
  //   this.form.setValue({
  //     title: auditory.title,
  //     description: auditory.description,
  //     date: auditory.date,
  //     time: auditory.time,
  //     lat: auditory.lat,
  //     lng: auditory.lng,
  //   });

  //   this.evidenceService
  //     .getEvidencesByAuditory(this.auditoryId)
  //     .subscribe({
  //       next: (res: any) => {
  //         if (res !== DATABASE_WAITING_MESSAGE) {
  //           if (isPlatform('hybrid')) {
  //             res.values.forEach(async (row: any) => {
  //               this.photoService.getLocalEvidenceUri(row.dir).then(photo => {
  //                 this.ImageSrc.push({
  //                   id: row.dir,
  //                   url: Capacitor.convertFileSrc(photo.uri),
  //                   base64: '',
  //                   expand: {
  //                     width: '25%'
  //                   },
  //                 });
  //               })
  //             });
  //           } else {
  //             res.values.forEach(async (row: any) => {
  //               this.photoService.getLocalEvidence(row.dir).then(photo => {
  //                 const file = 'data:image/png;base64,' + photo.data;
  //                 this.ImageSrc.push({
  //                   id: row.dir,
  //                   url: file,
  //                   base64: file,
  //                   expand: {
  //                     width: '25%'
  //                   },
  //                 });
  //               })
  //             });
  //           }
  //         }
  //       }
  //     });

  //   setTimeout(() => {
  //     this.mapService.setCenter(auditory.lat, auditory.lng);
  //     this.loadingService.dismissLoading();
  //   }, 1000)
  // }

  ngOnInit(): void {
    this.hideMap = true;
    this.initForm()
  }

  ionViewWillEnter() {
    // this.mapService.removeMap();
    this.initForm();
    console.log(this.functions)
    console.log(this.toListUrl)
    console.log(this.toFormUrl)
    // this.route
    //   .paramMap
    //   .subscribe({
    //     next: paramMap => {
    //       // this.hideMap = false;
    //       let id = paramMap.get('id') || '0';
    //       if (id === '00') {
    //         this.backUrl = this.toListUrl('local');
    //         id = '0';
    //       }
    //       if (id !== '0') {
    //         this.loadingService.showLoading();
    //         this.auditoryId = id;
    //         this.formActionText = 'Actualizando';
    //         this.SubmitButtonText = 'Guardar';
    //         this.service
    //           .getLocalForm(this.auditoryId)
    //           .subscribe({
    //             next: (res: any) => {
    //               if (res !== DATABASE_WAITING_MESSAGE) {
    //                 this.setAuditory(res.values[0]);
    //               }
    //             },
    //             error: (err: any) => {
    //               this.responseService.onError(err, 'No se pudieron recuperar los datos');
    //             },
    //           })
    //       }
    //     }
    //   }).unsubscribe();
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
    this.formSubmited = true;
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

  // async onAddPhoto() {
  //   const actionSheet = await this.actionSheetCtrl.create({
  //     header: 'Opciones',
  //     mode: 'ios',
  //     buttons: [
  //       {
  //         text: 'Cámara',
  //         handler: () => this.fromCamera(),
  //       },
  //       {
  //         text: 'Galería',
  //         handler: () => this.fromGallery(),
  //       },
  //       {
  //         text: 'Cerrar',
  //         role: 'cancel',
  //         data: {
  //           action: 'cancel',
  //         },
  //       },
  //     ],
  //   });

  //   await actionSheet.present();

  // }

  // fromGallery() {
  //   this.photoService.openGallery().then(async res => {
  //     if (this.auditoryId === '0') {
  //       for (let index = 0; index < res.photos.length; index++) {
  //         this.ImageSrc.push({
  //           id: '',
  //           url: this.sanitization.bypassSecurityTrustUrl(res.photos[index].webPath),
  //           base64: res.photos[index].webPath,
  //           expand: {
  //             width: '25%'
  //           },
  //         });
  //       }
  //     } else {
  //       for (let index = 0; index < res.photos.length; index++) {
  //         const img = res.photos[index].webPath;
  //         const blob = await fetch(img).then(r => r.blob());

  //         this.photoService
  //           .saveLocalBeltAuditoryEvidence(blob, this.auditoryId)
  //           .then(photoId => {
  //             if (photoId !== DATABASE_WAITING_MESSAGE) {
  //               this.evidenceService
  //                 .localSave({ auditoryId: this.auditoryId, dir: photoId })
  //                 .subscribe({
  //                   next: async (save: any) => {
  //                     if (save !== DATABASE_WAITING_MESSAGE) {
  //                       this.evidenceService
  //                         .getLastInsertedDir()
  //                         .subscribe({
  //                           next: async (res2: any) => {
  //                             if (res2 !== DATABASE_WAITING_MESSAGE) {
  //                               this.ImageSrc.push({
  //                                 id: res2.values[0].dir,
  //                                 url: this.sanitization.bypassSecurityTrustUrl(img),
  //                                 base64: img,
  //                                 expand: {
  //                                   width: '25%'
  //                                 },
  //                               });
  //                             }
  //                           }
  //                         });
  //                     }
  //                   },
  //                   error: (err: any) => {
  //                     this.responseService.onError(err, 'No se pudo guardar una imagen')
  //                   },
  //                 })
  //             }
  //           });
  //       }
  //     }
  //   });
  // }

  // fromCamera() {
  //   this.photoService.takePicture().then(async res => {
  //     if (this.auditoryId === '0') {
  //       this.ImageSrc.push({
  //         id: '',
  //         url: this.sanitization.bypassSecurityTrustUrl(res.webPath || ''),
  //         base64: res.webPath || '',
  //         trueb64: res.base64String,
  //         expand: {
  //           width: '25%'
  //         },
  //       });
  //     } else {
  //       const img = res.webPath || '';
  //       const blob = await fetch(img).then(r => r.blob());

  //       this.photoService
  //         .saveLocalBeltAuditoryEvidence(blob, this.auditoryId)
  //         .then(photoId => {
  //           if (photoId !== DATABASE_WAITING_MESSAGE) {
  //             this.evidenceService
  //               .localSave({ auditoryId: this.auditoryId, dir: photoId })
  //               .subscribe({
  //                 next: async (save: any) => {
  //                   if (save !== DATABASE_WAITING_MESSAGE) {
  //                     this.evidenceService
  //                       .getLastInsertedDir()
  //                       .subscribe({
  //                         next: async (res2: any) => {
  //                           if (res2 !== DATABASE_WAITING_MESSAGE) {
  //                             this.ImageSrc.push({
  //                               id: res2.values[0].dir,
  //                               url: this.sanitization.bypassSecurityTrustUrl(img),
  //                               base64: img,
  //                               expand: {
  //                                 width: '25%'
  //                               },
  //                             });
  //                           }
  //                         }
  //                       });
  //                   }
  //                 },
  //                 error: (err: any) => {
  //                   this.responseService.onError(err, 'No se pudo guardar una imagen')
  //                 },
  //               });
  //           }
  //         });

  //     }
  //   });
  // }

  onSetCoords(coords: any) {
    this.form.controls['lat'].setValue(coords.lat);
    this.form.controls['lng'].setValue(coords.lng);
  }

  // async onImgClicked(dir: string, index: number) {
  //   const actionSheet = await this.actionSheetCtrl.create({
  //     header: 'Opciones',
  //     mode: 'ios',
  //     buttons: [
  //       {
  //         text: 'Cambiar tamaño',
  //         handler: () => this.onChangeSize(index),
  //       },
  //       {
  //         text: 'Eliminar Foto',
  //         role: 'destructive',
  //         handler: () => this.onRemove(dir, index),
  //       },
  //       {
  //         text: 'Cerrar',
  //         role: 'cancel',
  //         data: {
  //           action: 'cancel',
  //         },
  //       },
  //     ],
  //   });

  //   await actionSheet.present();
  // }

  onChangeSize(index: number) {
    this.ImageSrc[index].expand = this.ImageSrc[index].expand.width === '25%' ? { width: '100%' } : { width: '25%' };
  }

  // onRemove(dir: string, index: number) {
  //   this.confirmDialogService.presentAlert('¿Desea eliminar la imagen?', () => {
  //     if (!!dir) {
  //       this.evidenceService
  //         .localRemove(dir)
  //         .subscribe({
  //           next: () => {
  //             this.photoService
  //               .removeLocalEvidence(dir)
  //               .then(() => this.ImageSrc.splice(index, 1));
  //           }
  //         })
  //     } else {
  //       this.ImageSrc.splice(index, 1);
  //     }
  //   });
  // }

  onLocationSelected() {
    this.form.controls['location'].setValue('Ubicación seleccionada');
    this.coordsAccepted = true;
  }

}
