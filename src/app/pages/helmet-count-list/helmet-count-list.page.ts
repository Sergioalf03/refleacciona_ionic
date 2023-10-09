import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController } from '@ionic/angular';
import { URI_HELMET_COLLECION_DETAIL, URI_HELMET_COUNT_FORM } from 'src/app/core/constants/uris';
import { LoadingService } from 'src/app/core/controllers/loading.service';
import { HelmetCollectionService } from 'src/app/services/helmet-collection.service';

const directions = [
  { id: 1, text: 'NE' },
  { id: 2, text: 'N' },
  { id: 3, text: 'NO' },
  { id: 4, text: 'E' },
  { id: 5, text: 'O' },
  { id: 6, text: 'SE' },
  { id: 7, text: 'S' },
  { id: 8, text: 'SO' },
];

@Component({
  selector: 'app-helmet-count-list',
  templateUrl: './helmet-count-list.page.html',
})
export class HelmetCountListPage implements OnInit {

  backUrl = URI_HELMET_COLLECION_DETAIL('0');
  counts: any[] = [];
  loading = true;
  auditoryId = '0';

  constructor(
    private helmetCollectionService: HelmetCollectionService,
    private actionSheetCtrl: ActionSheetController,
    private loadingSerivice: LoadingService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit() {
  }

  ionViewDidEnter() {
    this.activatedRoute
      .paramMap
      .subscribe({
        next: paramMap => {
          this.loadingSerivice.showLoading();
          this.loading = true;

          this.auditoryId = paramMap.get('id') || '0';

          this.counts = this.helmetCollectionService.list.map(c => {

            return {
              originText: directions.find(d => +d.id === +c.origin)!.text,
              destinationText: directions.find(d => +d.id === +c.destination)!.text,
              ...c,
            };
          });

          this.loading = false;
          setTimeout(() => {
            this.loadingSerivice.dismissLoading();
          }, 500);
        }
      });
  }

  async presentActionSheetOptions(count: any) {
    const buttons = [
      {
        text: 'Eliminar',
        role: 'destructive',
        handler: () => this.onDelete(count.id),
      },
      {
        text: 'Cerrar',
        role: 'cancel',
        data: {
          action: 'cancel',
        },
      },
    ];

    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Opciones',
      mode: 'ios',
      buttons: buttons,
    });

    await actionSheet.present();
  }

  private onDelete(id: string) {
    const index = this.helmetCollectionService.list.findIndex((count) => count.id === id);

    if (index > -1) {
      this.helmetCollectionService.list.splice(index, 1);

      this.counts = this.helmetCollectionService.list.map(c => {

        return {
          originText: directions.find(d => +d.id === +c.origin)!.text,
          destinationText: directions.find(d => +d.id === +c.destination)!.text,
          ...c,
        };
      });
    }
  }

  onNewCount() {
    this.router.navigateByUrl(URI_HELMET_COUNT_FORM(this.auditoryId));
  }

}
