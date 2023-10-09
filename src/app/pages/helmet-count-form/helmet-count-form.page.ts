import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { URI_HELMET_COLLECION_DETAIL } from 'src/app/core/constants/uris';
import { HelmetCollectionService } from 'src/app/services/helmet-collection.service';

@Component({
  selector: 'app-helmet-count-form',
  templateUrl: './helmet-count-form.page.html',
})
export class HelmetCountFormPage implements OnInit {

  backUrl = URI_HELMET_COLLECION_DETAIL('0');

  originDirection = 'Origen';
  destinationDirection = 'Destino';

  userCount = 1;
  helmetCount = 0;

  directions = [
    { id: 1, text: 'Noreste' },
    { id: 2, text: 'Norte' },
    { id: 3, text: 'Noroeste' },
    { id: 4, text: 'Este' },
    { id: 5, text: 'Oeste' },
    { id: 6, text: 'Sureste' },
    { id: 7, text: 'Sur' },
    { id: 8, text: 'Suroeste' },
  ];

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
  ) { }

  ngOnInit() {
    this.activatedRoute
      .paramMap
      .subscribe({
        next: paramMap => {
          this.auditoryId = paramMap.get('id') || '0';
          this.backUrl = URI_HELMET_COLLECION_DETAIL(this.auditoryId);
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
    this.helmetCollectionService.list.push({
      origin: this.originId,
      destination: this.destinationId,
      userCount: this.userCount,
      helmetCount: this.helmetCount,
    });
    this.router.navigateByUrl(URI_HELMET_COLLECION_DETAIL(this.auditoryId));
  }

  onCancel() {
    this.router.navigateByUrl(URI_HELMET_COLLECION_DETAIL(this.auditoryId));
  }



}
