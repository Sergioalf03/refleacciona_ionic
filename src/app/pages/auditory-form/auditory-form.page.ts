import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpResponseService } from 'src/app/core/controllers/http-response.service';
import { ValidFormService } from 'src/app/core/controllers/valid-form.service';
import { AuditoryService } from 'src/app/services/auditory.service';

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

  form!: FormGroup;

  constructor(
    private auditoryService: AuditoryService,
    private router: Router,
    private route: ActivatedRoute,
    private validFormService: ValidFormService,
    private responseService: HttpResponseService,
  ) { }

  private initForm() {
    this.form = new FormGroup({
      street: new FormControl('', {
        validators: [ Validators.required ]
      }),
      type: new FormControl(''),
      way: new FormControl(''),
      date: new FormControl(''),
      lat: new FormControl(''),
      lng: new FormControl(''),
    });
  }

  private createAuditory(auditory: any) {
    this.auditoryService
      .save(auditory)
      .subscribe({
        next: res => {
          this.auditoryId = res.data.id;
          this.submitLoading = false;
          this.responseService.onSuccessAndRedirect('/home', 'Auditoría guarda');
        },
        error: err => {
          this.submitLoading = false;
          this.responseService.onError(err, 'No se pudo guardar')
        },
      })
  }

  private updateAuditory(auditory: any) {
    this.auditoryService
      .update(this.auditoryId, auditory)
      .subscribe({
        next: () => {
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
      street: auditory.street,
      type: auditory.type,
      way: auditory.way,
      date: auditory.date,
      lat: auditory.lat,
      lng: auditory.lng,
    })
    this.fetchLoading = false;
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.initForm();
    this.route
      .paramMap
      .subscribe({
        next: paramMap => {
          const id = paramMap.get('id') || '0';
          if (id !== '0') {
            this.fetchLoading = true;
            this.auditoryId = id;
            this.formActionText = 'Actualizando';
            this.SubmitButtonText = 'Guardar';
            this.auditoryService
              .getForm(this.auditoryId)
              .subscribe({
                next: res => {
                  this.responseService.onSuccess('Se recuperaron los datos');
                  this.fetchLoading = false;

                  this.setAuditory(res.data);
                },
                error: err => {
                  this.fetchLoading = false;
                  this.responseService.onError(err, 'No se pudieron recuperar los datos');
                }
              })
          }
        }
      });
  }

  onSubmit() {
    if (this.validFormService.isValid(this.form, [])) {
      this.submitLoading = true;

      const auditory = {
        date: this.form.controls['date'].value,
        street: this.form.controls['street'].value,
        street_type: this.form.controls['type'].value,
        street_way: this.form.controls['way'].value,
        lat: this.form.controls['lat'].value,
        lng: this.form.controls['lng'].value,
      };

      console.log(this.auditoryId)

      if (this.auditoryId === '0') {
        this.createAuditory(auditory);
      } else {
        this.updateAuditory(auditory);
      }
    }
  }


  onAddLocation() {

  }

  onGoingHome() {
    this.router.navigateByUrl('home');
  }

}