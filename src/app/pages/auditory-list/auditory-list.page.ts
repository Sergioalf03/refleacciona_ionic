import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmDialogService } from 'src/app/core/controllers/confirm-dialog.service';
import { DatabaseService } from 'src/app/core/controllers/database.service';
import { HttpResponseService } from 'src/app/core/controllers/http-response.service';
import { AuditoryService } from 'src/app/services/auditory.service';
import { ActionSheetController } from '@ionic/angular';

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
    private databaseService: DatabaseService,
    private router: Router,
    private confirmDialogService: ConfirmDialogService,
    private actionSheetCtrl: ActionSheetController,
  ) { }

  ngOnInit() {
  }

  async ionViewWillEnter() {
    this.loading = true;

    this.auditoryService
      .getLocalList()
      .subscribe({
        next: res => {
          console.log(res)
          if (res !== 'waiting') {
            this.auditories = res.values.map((a: any) => ({
              ...a,
              statusWord: a.status === 1 ? 'En progreso' : 'Terminada',
            }));
            this.loading = false;
            // this.responseService.onSuccess('Auditorías recuperadas');
          }
        },
        error: err => {
          this.responseService.onError(err, 'No se pudieron recuperar las auditorías');
          this.loading = false;
        }
      })
  }

  onGoingHome() {
    this.router.navigateByUrl('/home');
  }

  onEdit(id: string) {
    this.router.navigateByUrl(`/auditory-form/${id}`);
  }

  onEditAnswers(id: string) {
    this.router.navigateByUrl(`/question-form/${id}/1`);
  }

  onFinish(id: string) {
    this.router.navigateByUrl(`/auditory-finish-form/${id}`);
  }

  onNewAuditory() {
    this.router.navigateByUrl(`/auditory-form/00`);
  }

  onDelete(id: string) {
    this.confirmDialogService.presentAlert('¿Desea eliminar la auditoría?', () => {
      this.loading = true;
      this.auditoryService
        .deleteLocal(id)
        .subscribe({
          next: (rm) => {
            if (rm !== 'waiting') {
              this.loading = false;
              this.responseService.onSuccess('Auditoría eliminada');
              this.ionViewWillEnter();
            }
          },
          error: err => {
            this.responseService.onError(err, 'No se pudo eliminar la auditoría');
            this.loading = false;
          }
        })
    });
  }

  async presentActionSheetOptions(id: string) {
    console.log(id);
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Opciones',
      mode: 'ios',
      buttons: [
        {
          text: 'Actualizar Auditoría',
          handler: () => this.onEdit(id),
        },
        {
          text: 'Actualizar Respuestas',
          handler: () => this.onEditAnswers(id),
        },
        // {
        //   text: 'Finalizar auditoría',
        //   handler: () => this.onFinish(id),
        // },
        {
          text: 'Eliminar Auditoría',
          role: 'destructive',
          handler: () => this.onDelete(id),
        },
        {
          text: 'Cerrar',
          role: 'cancel',
          data: {
            action: 'cancel',
          },
        },
      ],
    });

    await actionSheet.present();
  }

}
