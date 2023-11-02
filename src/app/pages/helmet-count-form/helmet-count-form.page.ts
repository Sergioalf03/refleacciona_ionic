import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { DIRECTIONS } from 'src/app/core/constants/directions';
import { URI_HELMET_COLLECION_DETAIL } from 'src/app/core/constants/uris';
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

  backUrl = URI_HELMET_COLLECION_DETAIL('1', '0');

  originDirection = 'Origen';
  destinationDirection = 'Destino';

  userCount = 1;
  helmetCount = 0;

  directions = DIRECTIONS;

  disableUserDecrease = true;
  disableHelmetDecrease = true;
  disableHelmetIncrease = false;
  submitButtonText = 'Guardar';
  originId = -1;
  destinationId = -1;
  canSubmit = false;
  auditoryId = '0';

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
          this.backUrl = URI_HELMET_COLLECION_DETAIL('1', this.auditoryId);
        }
      }).unsubscribe();;
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
    this.userCount++;
    this.disableUserDecrease = false;
    this.disableHelmetIncrease = false;
  }

  decreaseUsers() {
    if (this.userCount > 1) {
      this.userCount--;
      this.disableUserDecrease = this.userCount === 1;
      if (this.helmetCount > this.userCount) {
        this.helmetCount = this.userCount
      }
      this.disableHelmetIncrease = this.helmetCount === this.userCount;
    }
  }

  increaseHelmets() {
    if (this.helmetCount < this.userCount) {
      this.helmetCount++;
      this.disableHelmetIncrease = this.helmetCount === this.userCount;
      this.disableHelmetDecrease = false;
    }
  }

  decreaseHelmets() {
    if (this.helmetCount > 0) {
      this.helmetCount--;
      this.disableHelmetDecrease = this.helmetCount === 0;
      this.disableHelmetIncrease = false;
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
        userCount: this.userCount,
        helmetCount: this.helmetCount,
      };

      this.helmetCollectionService
        .save(data)
        .subscribe({
          next: res => {
            if (res !== DATABASE_WAITING_MESSAGE) {

              this.loadingService.dismissLoading();
              this.router.navigateByUrl(URI_HELMET_COLLECION_DETAIL('1', this.auditoryId));
            }
          },
          error: err => {
            this.responseService.onError(err, 'No se pudo guardar el conteo');
          }
        });
    })
  }

  onCancel() {
    this.router.navigateByUrl(URI_HELMET_COLLECION_DETAIL('1', this.auditoryId));
  }



}
