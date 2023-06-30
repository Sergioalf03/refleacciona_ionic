import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmDialogService } from 'src/app/core/controllers/confirm-dialog.service';
import { DatabaseService } from 'src/app/core/controllers/database.service';
import { HttpResponseService } from 'src/app/core/controllers/http-response.service';
import { AuditoryService } from 'src/app/services/auditory.service';
import { ActionSheetController } from '@ionic/angular';
import { LoadingService } from 'src/app/core/controllers/loading.service';

@Component({
  selector: 'app-auditory-list',
  templateUrl: './auditory-list.page.html',
})
export class AuditoryListPage implements OnInit {

  auditories: any[] = [];
  loading = false;

  constructor(
    private auditoryService: AuditoryService,
    private responseService: HttpResponseService,
    private loadingService: LoadingService,
    private router: Router,
    private confirmDialogService: ConfirmDialogService,
    private actionSheetCtrl: ActionSheetController,
  ) { }

  ngOnInit() {
  }

  async ionViewWillEnter() {
    this.fetchList();
  }

  onGoingHome() {
    this.router.navigateByUrl('/home');
  }

  onEdit(id: string) {
    this.router.navigateByUrl(`/auditory-form/${id}`);
  }

  onEditAnswers(id: string, lastIndex: number) {
    this.router.navigateByUrl(`/question-form/${id}/${lastIndex}`);
  }

  onFinish(id: string) {
    this.router.navigateByUrl(`/auditory-finish-form/${id}`);
  }

  onNewAuditory() {
    this.router.navigateByUrl(`/auditory-form/00`);
  }

  onDelete(id: string) {
    this.confirmDialogService.presentAlert('¿Desea eliminar la auditoría?', () => {
      this.loadingService.showLoading();
      this.auditoryService
        .deleteLocal(id)
        .subscribe({
          next: (rm) => {
            if (rm !== 'waiting') {
              this.responseService.onSuccess('Auditoría eliminada');
              setTimeout(() => {
                this.fetchList();
              }, 100)
            }
          },
          error: err => {
            this.responseService.onError(err, 'No se pudo eliminar la auditoría');
          }
        })
    });
  }

  async presentActionSheetOptions(auditory: any) {

    const buttons = auditory.status === 1 ?
      auditory.answersCompleted ? [
        {
          text: 'Actualizar Auditoría',
          handler: () => this.onEdit(auditory.id),
        },
        {
          text: 'Actualizar Respuestas',
          handler: () => this.onEditAnswers(auditory.id, 1),
        },
        {
          text: 'Finalizar auditoría',
          handler: () => this.onFinish(auditory.id),
        },
        {
          text: 'Eliminar Auditoría',
          role: 'destructive',
          handler: () => this.onDelete(auditory.id),
        },
        {
          text: 'Cerrar',
          role: 'cancel',
          data: {
            action: 'cancel',
          },
        },
      ] :
      [
          {
            text: 'Actualizar Auditoría',
            handler: () => this.onEdit(auditory.id),
          },
          {
            text: 'Actualizar Respuestas',
            handler: () => this.onEditAnswers(auditory.id, auditory.lastIndex),
          },
          {
            text: 'Eliminar Auditoría',
            role: 'destructive',
            handler: () => this.onDelete(auditory.id),
          },
          {
            text: 'Cerrar',
            role: 'cancel',
            data: {
              action: 'cancel',
            },
          },
      ] :
      [
        {
          text: 'Actualizar Auditoría',
          handler: () => this.onEdit(auditory.id),
        },
        {
          text: 'Actualizar Respuestas',
          handler: () => this.onEditAnswers(auditory.id, 1),
        },
        {
          text: 'Actualizar Finalización',
          handler: () => this.onFinish(auditory.id),
        },
        {
          text: 'Eliminar Auditoría',
          role: 'destructive',
          handler: () => this.onDelete(auditory.id),
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


  private fetchList() {
    this.loadingService.showLoading();
    this.loading = true;

    this.auditoryService
      .getLocalList()
      .subscribe({
        next: res => {
          console.log(res);
          if (res !== 'waiting') {
            this.auditories = res.map((a: any) => ({
              ...a,
              statusWord: a.status === 1 ? 'En progreso' : 'Terminada',
            }));
            this.loading = false;
            this.loadingService.dismissLoading();
          }
        },
        error: err => {
          this.responseService.onError(err, 'No se pudieron recuperar las auditorías');
        }
      })
  }

}
