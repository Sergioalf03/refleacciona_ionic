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

@Component({
  selector: 'app-auditory-form',
  templateUrl: './auditory-form.page.html',
})
export class AuditoryFormPage implements OnInit {

  formActionText = 'Nueva';
  SubmitButtonText = 'Comenzar';
  auditoryId = '0';

  fetchLoading = false;
  submitLoading = false;
  locationAdded = false;
  hideMap = true;

  form!: FormGroup;

  ImageSrc:any = [];
  ListPhotos: any = 10;

  constructor(
    private auditoryService: AuditoryService,
    private auditoryEvidenceService: AuditoryEvidenceService,
    private router: Router,
    private route: ActivatedRoute,
    private validFormService: ValidFormService,
    private responseService: HttpResponseService,
    private mapService: MapService,
    private photoService: PhotoService,
  ) { }

  private initForm() {
    this.form = new FormGroup({
      title: new FormControl('', {
        validators: [ Validators.required ]
      }),
      description: new FormControl(''),
      date: new FormControl(''),
      lat: new FormControl(''),
      lng: new FormControl(''),
    });
  }

  private createAuditory(auditory: any) {
    this.auditoryService
      .localSave(auditory)
      .subscribe({
        next: () => {

          this.auditoryService
            .getLastSavedId()
            .subscribe({
              next: async res => {
                this.hideMap = true;
                this.auditoryId = res.values[0].id;

                let count = 0;

                this.ImageSrc.forEach(async (src: any) => {
                  const blob = await fetch(src).then(r => r.blob());

                  const photoId = this.photoService.saveLocalEvidence(blob, this.auditoryId);

                  this.auditoryEvidenceService
                    .localSave({ auditoryId: this.auditoryId, dir: photoId })
                    .subscribe({
                      next: async res => {
                        count++;
                        if (count === this.ImageSrc.length) {
                          this.submitLoading = false;
                          this.responseService.onSuccessAndRedirect('/home', 'Auditoría guarda');
                        }
                      },
                      error: err => {
                        this.responseService.onError(err, 'No se pudo guardar una imagen')
                      },
                    })
                });
              }
            });
        },
        error: err => {
          this.submitLoading = false;
          this.responseService.onError(err, 'No se pudo guardar')
        },
      })
  }

  private updateAuditory(auditory: any) {
    this.auditoryService
      .updateLocal(this.auditoryId, auditory)
      .subscribe({
        next: () => {
          this.hideMap = true;
          this.submitLoading = false;
          this.responseService.onSuccessAndRedirect('/auditory-list', 'Auditoría actualizada');
        },
        error: err => {
          this.submitLoading = false;
          this.responseService.onError(err, 'No se pudo actualizar')
        },
      })
  }

  private setAuditory(auditory: any) {
    this.form.setValue({
      title: auditory.title,
      description: auditory.description,
      date: auditory.date,
      lat: auditory.lat,
      lng: auditory.lng,
    });

    setTimeout(() => {
      this.mapService.setCenter(auditory.lat, auditory.lng);
    }, 1000)
    this.fetchLoading = false;
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
          const id = paramMap.get('id') || '0';
          if (id !== '0') {
            this.fetchLoading = true;
            this.auditoryId = id;
            this.formActionText = 'Actualizando';
            this.SubmitButtonText = 'Guardar';
            this.auditoryService
              .getLocalForm(this.auditoryId)
              .subscribe({
                next: res => {
                  console.log(res);
                  this.responseService.onSuccess('Se recuperaron los datos');
                  this.fetchLoading = false;

                  this.setAuditory(res.values[0]);
                },
                error: err => {
                  this.fetchLoading = false;
                  this.responseService.onError(err, 'No se pudieron recuperar los datos');
                },
              })
          }
        }
      });
  }

  ionViewWillLeave() {
    console.log('leave')
    this.hideMap = true;
  }

  onSubmit() {
    if (this.validFormService.isValid(this.form, [])) {
      this.submitLoading = true;

      this.mapService.setCenter(0, 0);
      const auditory = {
        title: this.form.controls['title'].value,
        description: this.form.controls['description'].value,
        date: this.form.controls['date'].value,
        lat: this.form.controls['lat'].value,
        lng: this.form.controls['lng'].value,
      };

      if (this.auditoryId === '0') {
        this.createAuditory(auditory);
      } else {
        this.updateAuditory(auditory);
      }
    }
  }


  async onAddLocation() {
    const coordinates = await Geolocation.getCurrentPosition();
    this.mapService.setCenter(coordinates.coords.latitude, coordinates.coords.longitude);
  }

  onGoingHome() {
    this.router.navigateByUrl('home');
  }

  onAddPhoto() {
    let text = '';
    this.photoService.openGallery(text).then(async res => {
      for (let index = 0; index < res.photos.length; index++) {
        this.ImageSrc.push(res.photos[index].webPath);
      }
      console.log(this.ImageSrc);
    });
  }

  onSetCoords(coords: any) {
    console.log(coords);
    this.form.controls['lat'].setValue(coords.lat);
    this.form.controls['lng'].setValue(coords.lng);
  }

}
