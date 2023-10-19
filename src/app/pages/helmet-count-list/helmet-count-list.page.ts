import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController } from '@ionic/angular';
import { DIRECTIONS } from 'src/app/core/constants/directions';
import { DATABASE_WAITING_MESSAGE } from 'src/app/core/constants/message-code';
import { URI_HELMET_COLLECION_DETAIL, URI_HELMET_COUNT_FORM } from 'src/app/core/constants/uris';
import { ConfirmDialogService } from 'src/app/core/controllers/confirm-dialog.service';
import { HttpResponseService } from 'src/app/core/controllers/http-response.service';
import { LoadingService } from 'src/app/core/controllers/loading.service';
import { HelmetCollectionService } from 'src/app/services/helmet-collection.service';

const directions = DIRECTIONS;

@Component({
  selector: 'app-helmet-count-list',
  templateUrl: './helmet-count-list.page.html',
})
export class HelmetCountListPage implements OnInit {

  backUrl = URI_HELMET_COLLECION_DETAIL('0', '0');
  counts: any[] = [];
  loading = true;
  auditoryId = '0';

  constructor(
    private helmetCollectionService: HelmetCollectionService,
    private actionSheetCtrl: ActionSheetController,
    private loadingSerivice: LoadingService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private responseService: HttpResponseService,
    private confirmDialog: ConfirmDialogService,
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
          this.backUrl = URI_HELMET_COLLECION_DETAIL('0', this.auditoryId);

          this.loadList();
        }
      });
  }

  private loadList() {
    this.helmetCollectionService
      .getList(this.auditoryId)
      .subscribe({
        next: res => {
          if (res !== DATABASE_WAITING_MESSAGE) {

            this.counts = res.values.map((c: any) => {

              return {
                originText: directions.find(d => +d.id === +c.origin)!.short,
                destinationText: directions.find(d => +d.id === +c.destination)!.short,
                ...c,
              };
            });

            this.loading = false;
            this.loadingSerivice.dismissLoading();
          }
        },
        error: err => {
          this.responseService.onError(err, 'No se pudo guardar el conteo');
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
    this.confirmDialog.presentAlert('¿Desea eliminar el conteo?', () =>  {
      this.loadingSerivice.showLoading();
      this.helmetCollectionService
        .delete(id)
        .subscribe({
          next: res => {
            this.loadList();
          },
          error: err => {
            this.responseService.onError(err, 'No se pudo guardar el conteo');
          }
        });
    });
  }

  onNewCount() {
    this.router.navigateByUrl(URI_HELMET_COUNT_FORM(this.auditoryId));
  }

}
