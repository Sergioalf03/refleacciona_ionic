import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { DIRECTIONS } from 'src/app/core/constants/directions';
import { URI_HELMET_LIST } from 'src/app/core/constants/uris';
import { HelmetCollectionService } from 'src/app/services/helmet-collection.service';
import { ConfirmDialogService } from 'src/app/core/controllers/confirm-dialog.service';
import { ToastService } from 'src/app/core/controllers/toast.service';
import { LoadingService } from 'src/app/core/controllers/loading.service';
import { DATABASE_WAITING_MESSAGE } from 'src/app/core/constants/message-code';
import { HttpResponseService } from 'src/app/core/controllers/http-response.service';

@Component({
  selector: 'app-helmet-count-form',
  templateUrl: './helmet-count-form.page.html',
})
export class HelmetCountFormPage implements OnInit {

  backUrl = URI_HELMET_LIST('local');

  originDirection = 'Origen';
  destinationDirection = 'Destino';

  helmetlessCount = 0;
  helmetCount = 0;

  directions = DIRECTIONS;

  disableUserDecrease = true;
  disableHelmetDecrease = true;
  submitButtonText = 'Guardar';
  originId = -1;
  destinationId = -1;
  canSubmit = false;
  auditoryId = '0';

  countId = '0';

  constructor(
    private modalCtrl: ModalController,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private helmetCollectionService: HelmetCollectionService,
    private confirmDialogService: ConfirmDialogService,
    private toastService: ToastService,
    private loadingService: LoadingService,
    private responseService: HttpResponseService,
  ) { }

  ngOnInit() {
    this.activatedRoute
      .paramMap
      .subscribe({
        next: paramMap => {
          this.auditoryId = paramMap.get('id') || '0';
          this.backUrl = URI_HELMET_LIST('local');

          this.helmetCollectionService
            .getByAuditoryId(this.auditoryId)
            .subscribe({
              next: result =>  {
                if (result !== 'W' && result.values.length > 0) {
                  const count = result.values[0];

                  this.originId = count.origin;
                  this.destinationId = count.destination;
                  this.helmetCount = count.helmets_count;
                  this.helmetlessCount = count.users_count;

                  if (this.helmetCount !== 0) {
                    this.disableHelmetDecrease = false;
                  }

                  if (this.helmetlessCount !== 0) {
                    this.disableUserDecrease = false;
                  }

                  this.onOriginDismiss({ detail: { value: this.originId }});
                  this.onDestinationDismiss({ detail: { value: this.destinationId }});

                  this.countId = count.id;
                }
              },
              error: err => this.responseService.onError(err, 'No se pudo recuperar el conteo'),
            })
        }
      }).unsubscribe();
  }

  onOriginDismiss(evt: any) {
    const selectedDirection = this.directions.find((d: any) => +d.id === +evt.detail.value);
    this.originId = evt.detail.value;

    this.canSubmit = this.originId !== -1 && this.destinationId !== -1;

    if (selectedDirection) {
      this.originDirection = selectedDirection.text;
    }
  }

  onDestinationDismiss(evt: any) {
    const selectedDirection = this.directions.find((d: any) => +d.id === +evt.detail.value);
    this.destinationId = evt.detail.value;

    this.canSubmit = this.originId !== -1 && this.destinationId !== -1;

    if (selectedDirection) {
      this.destinationDirection = selectedDirection.text;
    }
  }

  increaseUsers() {
    this.helmetlessCount++;
    this.disableUserDecrease = false;
  }

  decreaseUsers() {
    if (this.helmetlessCount > 0) {
      this.helmetlessCount--;
      this.disableUserDecrease = this.helmetlessCount === 0;
    }
  }

  increaseHelmets() {
    this.helmetCount++;
    this.disableHelmetDecrease = false;
  }

  decreaseHelmets() {
    if (this.helmetCount > 0) {
      this.helmetCount--;
      this.disableHelmetDecrease = this.helmetCount === 0;
    }
  }

  onSubmit() {
    if (this.originId === -1) {
      this.toastService.showErrorToast('Seleccione un origen');
    }
    if (this.destinationId === -1) {
      this.toastService.showErrorToast('Seleccione un destino');
    }
    this.confirmDialogService.presentAlert('¿Desea guardar el conteo?', () => {
      this.loadingService.showLoading();

      const data = {
        helmet_auditory_id: this.auditoryId,
        origin: this.originId,
        destination: this.destinationId,
        helmetlessCount: this.helmetlessCount,
        helmetCount: this.helmetCount,
      };

      if (this.countId === '0') {
        this.helmetCollectionService
          .save(data)
          .subscribe({
            next: res => {
              if (res !== DATABASE_WAITING_MESSAGE) {

                this.loadingService.dismissLoading();
                this.router.navigateByUrl(URI_HELMET_LIST('local'));
              }
            },
            error: err => {
              this.responseService.onError(err, 'No se pudo guardar el conteo');
            }
          });
      } else {
        this.helmetCollectionService
          .update(this.countId, data)
          .subscribe({
            next: res => {
              if (res !== DATABASE_WAITING_MESSAGE) {

                this.loadingService.dismissLoading();
                this.router.navigateByUrl(URI_HELMET_LIST('local'));
              }
            },
            error: err => {
              this.responseService.onError(err, 'No se pudo guardar el conteo');
            }
          });
      }

    });
  }

  onCancel() {
    this.router.navigateByUrl(URI_HELMET_LIST('local'));
  }

}
