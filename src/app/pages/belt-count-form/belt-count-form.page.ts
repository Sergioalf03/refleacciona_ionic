import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { DIRECTIONS } from 'src/app/core/constants/directions';
import { DATABASE_WAITING_MESSAGE } from 'src/app/core/constants/message-code';
import { URI_BELT_COLLECION_DETAIL } from 'src/app/core/constants/uris';
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

  backUrl = URI_BELT_COLLECION_DETAIL('0', '0');

  originDirection = 'Origen';
  destinationDirection = 'Destino';
  vehicleType = 'Tipo Vehículo';

  beltUserCount = 1;
  beltCount = 0;

  chairUserCount = 0;
  chairCount = 0;

  overusedSeatsCount = 0;

  overusedSeats = 0;

  directions = DIRECTIONS;
  vehicleTypes = VEHICLE_TYPES;

  disableBeltUserDecrease = true;
  disableBeltDecrease = true;
  disableBeltIncrease = false;

  disableChairUserDecrease = true;
  disableChairDecrease = true;
  disableChairIncrease = false;

  disableOverusedDecrease = true;
  disableOverusedIncrease = true;

  submitButtonText = 'Guardar';
  originId = -1;
  destinationId = -1;
  vehicleTypeId = -1;
  canSubmit = false;
  auditoryId = '0';

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
          this.backUrl = URI_BELT_COLLECION_DETAIL('0' ,this.auditoryId);
        }
      });
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

  onVehiclenDismiss(evt: any) {
    const selectedVehicle = this.vehicleTypes.find((d: any) => +d.id === +evt.detail.value);
    this.vehicleTypeId = evt.detail.value;

    this.canSubmit = this.originId !== -1 && this.destinationId !== -1 && this.vehicleTypeId !== -1;

    if (selectedVehicle) {
      this.vehicleType = selectedVehicle.text;
    }
  }

  increaseBeltUsers() {
    this.beltUserCount++;
    this.disableBeltUserDecrease = false;
    this.disableBeltIncrease = false;
    this.disableOverusedIncrease = false;
  }

  decreaseBeltUsers() {
    if (this.beltUserCount > 1) {
      this.beltUserCount--;
      this.disableBeltUserDecrease = this.beltUserCount === 1;
      if (this.beltCount > this.beltUserCount) {
        this.beltCount = this.beltUserCount
      }
      this.disableBeltIncrease = this.beltCount === this.beltUserCount;
    }
  }

  increaseBelts() {
    if (this.beltCount < this.beltUserCount) {
      this.beltCount++;
      this.disableBeltIncrease = this.beltCount === this.beltUserCount;
      this.disableBeltDecrease = false;
    }
  }

  decreaseBelts() {
    if (this.beltCount > 0) {
      this.beltCount--;
      this.disableBeltDecrease = this.beltCount === 0;
      this.disableBeltIncrease = false;
    }
  }

  increaseChairUsers() {
    this.chairUserCount++;
    this.disableChairUserDecrease = false;
    this.disableChairIncrease = false;
    this.disableOverusedIncrease = false;
  }

  decreaseChairUsers() {
    if (this.chairUserCount > 0) {
      this.chairUserCount--;
      this.disableChairUserDecrease = this.chairUserCount === 0;
      if (this.chairCount > this.chairUserCount) {
        this.chairCount = this.chairUserCount
        this.disableChairDecrease = this.chairCount === 0;
      }
      this.disableChairIncrease = this.chairCount === this.chairUserCount;
    }
  }

  increaseChairs() {
    if (this.chairCount < this.chairUserCount) {
      this.chairCount++;
      this.disableChairIncrease = this.chairCount === this.chairUserCount;
      this.disableChairDecrease = false;
    }
  }

  decreaseChairs() {
    if (this.chairCount > 0) {
      this.chairCount--;
      this.disableChairDecrease = this.chairCount === 0;
      this.disableChairIncrease = false;
    }
  }

  increaseOverUsedSeats() {
    const total = this.beltUserCount + this.chairUserCount;
    if (total > 1 && this.overusedSeatsCount < total) {
      this.overusedSeatsCount++;
      this.disableOverusedDecrease = false;
      this.disableOverusedIncrease = this.overusedSeatsCount === total;
    }
  }

  decreaseOverUsedSeats() {
    if (this.overusedSeatsCount > 0) {
      this.overusedSeatsCount--;
      this.disableOverusedIncrease = false;
      this.disableOverusedDecrease = this.overusedSeatsCount === 0;
    }
  }

  onSubmit() {
    if (this.vehicleTypeId === -1) {
      this.toastService.showErrorToast('Seleccione un tipo de vehículo');
    }
    if (this.originId === -1) {
      this.toastService.showErrorToast('Seleccione un origen');
    }
    if (this.destinationId === -1) {
      this.toastService.showErrorToast('Seleccione un destino');
    }
    this.confirmDialogService.presentAlert('¿Desea guardar el conteo?', () => {
      this.loadingService.showLoading();

      const data = {
        belt_auditory_id: this.auditoryId,
        origin: this.originId,
        destination: this.destinationId,
        beltUserCount: this.beltUserCount,
        beltCount: this.beltCount,
        chairUserCount: this.chairUserCount,
        chairCount: this.chairCount,
        vehicleType: this.vehicleTypeId,
        overusedSeatsCount: this.overusedSeatsCount,
      };

      this.beltCollectionService
        .save(data)
        .subscribe({
          next: res => {
            console.log(res);
            if (res !== DATABASE_WAITING_MESSAGE) {

              this.loadingService.dismissLoading();
              this.router.navigateByUrl(URI_BELT_COLLECION_DETAIL('0', this.auditoryId));
            }
          },
          error: err => {
            this.responseService.onError(err, 'No se pudo guardar el conteo');
          }
        });
    })

  }

  onCancel() {
    this.router.navigateByUrl(URI_BELT_COLLECION_DETAIL('0', this.auditoryId));
  }

}
