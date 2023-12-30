import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DIRECTIONS } from 'src/app/core/constants/directions';
import { DATABASE_WAITING_MESSAGE } from 'src/app/core/constants/message-code';
import { URI_GENERAL_COUNT_LIST } from 'src/app/core/constants/uris';
import { VEHICLE_TYPES } from 'src/app/core/constants/vehicle-types';
import { ConfirmDialogService } from 'src/app/core/controllers/confirm-dialog.service';
import { HttpResponseService } from 'src/app/core/controllers/http-response.service';
import { LoadingService } from 'src/app/core/controllers/loading.service';
import { ToastService } from 'src/app/core/controllers/toast.service';
import { GeneralCountCollectionService } from 'src/app/services/general-count-collection.service';

@Component({
  selector: 'app-general-count-count-form',
  templateUrl: './general-count-count-form.page.html',
})
export class GeneralCountCountFormPage implements OnInit {

  backUrl = URI_GENERAL_COUNT_LIST('local');

  originDirection = 'Origen';
  destinationDirection = 'Destino';
  vehicleType = 'Tipo Vehículo';

  directions = DIRECTIONS;
  vehicleTypes = VEHICLE_TYPES;

  submitButtonText = 'Guardar';
  originId = -1;
  destinationId = -1;
  vehicleTypeId = -1;
  canSubmit = false;
  auditoryId = '0';

  urbanCount = 0;
  disableUrbanDecrease = false;

  sedansCount = 0;
  disableSedanDecrease = false;

  berlinaCount = 0;
  disableBerlinaDecrease = false;

  hatchbackCount = 0;
  disableHatchbackDecrease = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private generalCountCollectionService: GeneralCountCollectionService,
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
          this.backUrl = URI_GENERAL_COUNT_LIST('local');
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

  increaseUrban() {
    console.log('single click')
    this.urbanCount++;
    this.disableUrbanDecrease = false;
  }

  decreaseUrban() {
    console.log('double click')
    if (this.urbanCount > 0) {
      this.urbanCount--;
      this.disableUrbanDecrease = this.urbanCount === 0;
    }
  }

  increaseSedan() {
    this.sedansCount++;
    this.disableSedanDecrease = false;
  }

  decreaseSedan() {
    if (this.sedansCount > 0) {
      this.sedansCount--;
      this.disableSedanDecrease = this.sedansCount === 0;
    }
  }

  increaseBerlina() {
    this.berlinaCount++;
    this.disableBerlinaDecrease = false;
  }

  decreaseBerlina() {
    if (this.berlinaCount > 0) {
      this.berlinaCount--;
      this.disableBerlinaDecrease = this.berlinaCount === 0;
    }
  }

  increaseHatchback() {
    this.hatchbackCount++;
    this.disableHatchbackDecrease = false;
  }

  decreaseHatchback() {
    if (this.hatchbackCount > 0) {
      this.hatchbackCount--;
      this.disableHatchbackDecrease = this.hatchbackCount === 0;
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
        general_count_auditory_id: this.auditoryId,
        origin: this.originId,
        destination: this.destinationId,
        vehicleType: this.vehicleTypeId,
      };

      // this.generalCountCollectionService
      //   .save(data)
      //   .subscribe({
      //     next: res => {
      //       if (res !== DATABASE_WAITING_MESSAGE) {

      //         this.loadingService.dismissLoading();
      //         this.router.navigateByUrl(URI_GENERAL_COUNT_LIST('local'));
      //       }
      //     },
      //     error: err => {
      //       this.responseService.onError(err, 'No se pudo guardar el conteo');
      //     }
      //   });
    })

  }

  onCancel() {
    this.router.navigateByUrl(URI_GENERAL_COUNT_LIST('local'));
  }

}
