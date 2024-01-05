import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

const colors: any[] = [
  { name: 'Red', backgroundCode: '#CF2D2D', textCode: 'white' },
  { name: 'Green', backgroundCode: '#03B203', textCode: 'white' },
  { name: 'Blue', backgroundCode: '#2D2DC8', textCode: 'white' },
  { name: 'Yellow', backgroundCode: '#F4F41D', textCode: 'black' },
  { name: 'Purple', backgroundCode: '#800080', textCode: 'white' },
  { name: 'Orange', backgroundCode: '#FFA500', textCode: 'white' },
  { name: 'Cyan', backgroundCode: '#09F0F0', textCode: 'black' },
  { name: 'Pink', backgroundCode: '#FFC0CB', textCode: 'black' },
  { name: 'Teal', backgroundCode: '#008080', textCode: 'white' },
  { name: 'Brown', backgroundCode: '#4F2800', textCode: 'white' },
  { name: 'black', backgroundCode: '#0B0E0B', textCode: 'white' },
  { name: 'white', backgroundCode: '#FFFFFF', textCode: 'black' },
]

import { Gesture, GestureController, GestureDetail, IonCard } from '@ionic/angular';
import { DATABASE_WAITING_MESSAGE } from 'src/app/core/constants/message-code';
import { URI_GENERAL_COUNT_LIST } from 'src/app/core/constants/uris';
import { ConfirmDialogService } from 'src/app/core/controllers/confirm-dialog.service';
import { HttpResponseService } from 'src/app/core/controllers/http-response.service';
import { LoadingService } from 'src/app/core/controllers/loading.service';
import { GeneralCountCollectionService } from 'src/app/services/general-count-collection.service';

@Component({
  selector: 'app-swipe-form',
  templateUrl: './swipe-form.page.html',
})
export class SwipeFormPage implements AfterViewInit {

  counts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  names = [
    'Urbano',
    'Sedán',
    'Berlina',
    'Hatchback',
    'Cupé',
    'Descapotable',
    'Deportivo',
    'Todoterreno',
    'Monovolumen',
    'SUV',
    'Furgoneta',
    'Pickup'
  ];

  backgroundColor: string = 'lightgray';
  textColor: string = 'black';
  count = 0;

  startX = 0;
  endX = 0;

  countId = '0';

  toShowCount = 0;
  name = '';

  auditoryId = '';
  backUrl = URI_GENERAL_COUNT_LIST('local');

  @ViewChild('content', { read: ElementRef }) content!: ElementRef<HTMLParagraphElement>;
  @ViewChild('footer', { read: ElementRef }) footer!: ElementRef<HTMLParagraphElement>;

  constructor(
    private confirmDialogService: ConfirmDialogService,
    private loadingService: LoadingService,
    private generalCountCollectionService: GeneralCountCollectionService,
    private router: Router,
    private responseService: HttpResponseService,
    private activatedRoute: ActivatedRoute,
  ) {}

  ionViewWillEnter() {
    this.activatedRoute
      .paramMap
      .subscribe({
        next: paramMap => {
          this.auditoryId = paramMap.get('id') || '0';

          this.generalCountCollectionService
            .getCountForm(this.auditoryId)
            .subscribe({
              next: result => {
                if (result !== 'W' && result.values.length > 0) {
                  const count = result.values[0];

                  this.counts = [
                    count.count1,
                    count.count2,
                    count.count3,
                    count.count4,
                    count.count5,
                    count.count6,
                    count.count7,
                    count.count8,
                    count.count9,
                    count.count10,
                    count.count11,
                    count.count12,
                  ];

                  this.countId = count.id;
                }
              },
              error: err => this.responseService.onError(err, 'No se pudo recuperar el conteo'),
            });
        }
      }).unsubscribe();;
  }

  changeColor(whichSide: number) {
    this.count += whichSide;


    if (this.count > 11) {
      this.count = 0;
    }

    if (this.count < 0) {
      this.count = 11;
    }

    // Update the background color
    this.backgroundColor = colors[this.count].backgroundCode;
    this.textColor = colors[this.count].textCode;
  }

  onSelectIndex(index: number) {
    this.count = index;

    this.backgroundColor = colors[this.count].backgroundCode;
    this.textColor = colors[this.count].textCode;
  }

  ngAfterViewInit() {
    this.backgroundColor = colors[0].backgroundCode;
    this.textColor = colors[0].textCode;
  }

  countChange(toAdd: number) {
    if (toAdd === -1) {
      if (this.counts[this.count] > 0) {
        this.counts[this.count] += toAdd;
      }
    } else {
      this.counts[this.count] += toAdd;
    }
  }

  onSubmit() {
    this.confirmDialogService.presentAlert('¿Desea guardar el conteo?', () => {
      this.loadingService.showLoading();

      if (this.countId === '0') {

        this.generalCountCollectionService
          .save(this.auditoryId, [...this.counts])
          .subscribe({
            next: res => {
              if (res !== DATABASE_WAITING_MESSAGE) {

                this.loadingService.dismissLoading();
                this.router.navigateByUrl(URI_GENERAL_COUNT_LIST('local'));
              }
            },
            error: err => {
              this.responseService.onError(err, 'No se pudo guardar el conteo');
            }
          });

      } else {

        this.generalCountCollectionService
          .update(this.countId, [...this.counts])
          .subscribe({
            next: res => {
              if (res !== DATABASE_WAITING_MESSAGE) {

                this.loadingService.dismissLoading();
                this.router.navigateByUrl(URI_GENERAL_COUNT_LIST('local'));
              }
            },
            error: err => {
              this.responseService.onError(err, 'No se pudo guardar el conteo');
            }
          });

      }
    })
  }
}
