import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DIRECTIONS } from 'src/app/core/constants/directions';
import { DATABASE_WAITING_MESSAGE } from 'src/app/core/constants/message-code';
import { URI_GENERAL_COUNT_COLLECION_DETAIL } from 'src/app/core/constants/uris';
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

  backUrl = URI_GENERAL_COUNT_COLLECION_DETAIL('0', '0');

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
          this.backUrl = URI_GENERAL_COUNT_COLLECION_DETAIL('0', this.auditoryId);
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

      this.generalCountCollectionService
        .save(data)
        .subscribe({
          next: res => {
            if (res !== DATABASE_WAITING_MESSAGE) {

              this.loadingService.dismissLoading();
              this.router.navigateByUrl(URI_GENERAL_COUNT_COLLECION_DETAIL('0', this.auditoryId));
            }
          },
          error: err => {
            this.responseService.onError(err, 'No se pudo guardar el conteo');
          }
        });
    })

  }

  onCancel() {
    this.router.navigateByUrl(URI_GENERAL_COUNT_COLLECION_DETAIL('0', this.auditoryId));
  }

}
