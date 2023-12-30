import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { DIRECTIONS } from 'src/app/core/constants/directions';
import { DATABASE_WAITING_MESSAGE } from 'src/app/core/constants/message-code';
import { URI_BELT_LIST } from 'src/app/core/constants/uris';
import { VEHICLE_TYPES } from 'src/app/core/constants/vehicle-types';
import { ConfirmDialogService } from 'src/app/core/controllers/confirm-dialog.service';
import { HttpResponseService } from 'src/app/core/controllers/http-response.service';
import { LoadingService } from 'src/app/core/controllers/loading.service';
import { ToastService } from 'src/app/core/controllers/toast.service';
import { BeltCollectionService } from 'src/app/services/belt-collection.service';

@Component({
  selector: 'app-belt-count-form',
  templateUrl: './belt-count-form.page.html',
})
export class BeltCountFormPage implements OnInit {

  backUrl = URI_BELT_LIST('local');

  originDirection = 'Origen';
  destinationDirection = 'Destino';
  vehicleType = 'Tipo Vehículo';

  beltlessCount = 0;
  beltCount = 0;

  chairChairlessCount = 0;
  chairCount = 0;

  directions = DIRECTIONS;
  vehicleTypes = VEHICLE_TYPES;

  disableBeltUserDecrease = true;
  disableBeltDecrease = true;

  disableChairUserDecrease = true;
  disableChairDecrease = true;

  submitButtonText = 'Guardar';
  originId = -1;
  destinationId = -1;
  vehicleTypeId = -1;
  canSubmit = true;
  auditoryId = '0';

  countId = '0';

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private beltCollectionService: BeltCollectionService,
    private toastService: ToastService,
    private confirmDialogService: ConfirmDialogService,
    private loadingService: LoadingService,
    private responseService: HttpResponseService,
  ) { }

  ngOnInit() {
    this.activatedRoute
      .paramMap
      .subscribe({
        next: paramMap => {
          this.auditoryId = paramMap.get('id') || '0';
          this.backUrl = URI_BELT_LIST('local');

          this.beltCollectionService
            .getByAuditoryId(this.auditoryId)
            .subscribe({
              next: result =>  {
                if (result !== 'W' && result.values.length > 0) {
                  const count = result.values[0];

                  // this.originId = count.origin;
                  // this.destinationId = count.destination;

                  this.beltCount = count.belts_count;
                  this.beltlessCount = count.adults_count;
                  this.chairCount = count.chairs_count;
                  this.chairChairlessCount = count.child_count;

                  if (this.beltCount !== 0) {
                    this.disableBeltDecrease = false;
                  }

                  if (this.beltlessCount !== 0) {
                    this.disableBeltUserDecrease = false;
                  }

                  if (this.chairChairlessCount !== 0) {
                    this.disableChairUserDecrease = false;
                  }

                  if (this.chairCount !== 0) {
                    this.disableChairDecrease = false;
                  }

                  // this.onOriginDismiss({ detail: { value: this.originId }});
                  // this.onDestinationDismiss({ detail: { value: this.destinationId }});

                  this.countId = count.id;
                }
              },
              error: err => this.responseService.onError(err, 'No se pudo recuperar el conteo'),
            })
        }
      }).unsubscribe();;
  }

  onOriginDismiss(evt: any) {
    // const selectedDirection = this.directions.find((d: any) => +d.id === +evt.detail.value);
    // this.originId = evt.detail.value;

    // this.canSubmit = this.originId !== -1 && this.destinationId !== -1;

    // if (selectedDirection) {
    //   this.originDirection = selectedDirection.text;
    // }
  }

  onDestinationDismiss(evt: any) {
    // const selectedDirection = this.directions.find((d: any) => +d.id === +evt.detail.value);
    // this.destinationId = evt.detail.value;

    // this.canSubmit = this.originId !== -1 && this.destinationId !== -1;

    // if (selectedDirection) {
    //   this.destinationDirection = selectedDirection.text;
    // }
  }

  onVehiclenDismiss(evt: any) {
    // const selectedVehicle = this.vehicleTypes.find((d: any) => +d.id === +evt.detail.value);
    // this.vehicleTypeId = evt.detail.value;

    // this.canSubmit = this.originId !== -1 && this.destinationId !== -1 && this.vehicleTypeId !== -1;

    // if (selectedVehicle) {
    //   this.vehicleType = selectedVehicle.text;
    // }
  }

  increaseBeltUsers() {
    this.beltlessCount++;
    this.disableBeltUserDecrease = false;
  }

  decreaseBeltUsers() {
    if (this.beltlessCount > 0) {
      this.beltlessCount--;
      this.disableBeltUserDecrease = this.beltlessCount === 0;
    }
  }

  increaseBelts() {
    this.beltCount++;
    this.disableBeltDecrease = false;
  }

  decreaseBelts() {
    if (this.beltCount > 0) {
      this.beltCount--;
      this.disableBeltDecrease = this.beltCount === 0;
    }
  }

  increaseChairUsers() {
    this.chairChairlessCount++;
    this.disableChairUserDecrease = false;
  }

  decreaseChairUsers() {
    if (this.chairChairlessCount > 0) {
      this.chairChairlessCount--;
      this.disableChairUserDecrease = this.chairChairlessCount === 0;
    }
  }

  increaseChairs() {
    this.chairCount++;
    this.disableChairDecrease = false;
  }

  decreaseChairs() {
    if (this.chairCount > 0) {
      this.chairCount--;
      this.disableChairDecrease = this.chairCount === 0;
    }
  }

  onSubmit() {
    // if (this.originId === -1) {
    //   this.toastService.showErrorToast('Seleccione un origen');
    // }
    // if (this.destinationId === -1) {
    //   this.toastService.showErrorToast('Seleccione un destino');
    // }
    this.confirmDialogService.presentAlert('¿Desea guardar el conteo?', () => {
      this.loadingService.showLoading();

      const data = {
        belt_auditory_id: this.auditoryId,
        origin: this.originId,
        destination: this.destinationId,
        beltUserCount: this.beltlessCount,
        beltCount: this.beltCount,
        chairUserCount: this.chairChairlessCount,
        chairCount: this.chairCount,
      };

      if (this.countId === '0') {

        this.beltCollectionService
          .save(data)
          .subscribe({
            next: res => {
              if (res !== DATABASE_WAITING_MESSAGE) {

                this.loadingService.dismissLoading();
                this.router.navigateByUrl(URI_BELT_LIST('local'));
              }
            },
            error: err => {
              this.responseService.onError(err, 'No se pudo guardar el conteo');
            }
          });

      } else {
        this.beltCollectionService
          .update(this.countId, data)
          .subscribe({
            next: res => {
              if (res !== DATABASE_WAITING_MESSAGE) {

                this.loadingService.dismissLoading();
                this.router.navigateByUrl(URI_BELT_LIST('local'));
              }
            },
            error: err => {
              this.responseService.onError(err, 'No se pudo guardar el conteo');
            }
          });
      }
    })

  }

  onCancel() {
    this.router.navigateByUrl(URI_BELT_LIST('local'));
  }

}
