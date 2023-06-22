import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmDialogService } from 'src/app/core/controllers/confirm-dialog.service';
import { DatabaseService } from 'src/app/core/controllers/database.service';
import { HttpResponseService } from 'src/app/core/controllers/http-response.service';
import { AuditoryService } from 'src/app/services/auditory.service';

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
  ) { }

  ngOnInit() {
  }

  async ionViewWillEnter() {
    this.loading = true;
    await this.databaseService
      .initConnection()
      .then(() => {
        this.auditoryService
          .getLocalList()
          .subscribe({
            next: res => {
              console.log(res)
              if (res !== 'waiting') {
                this.auditories = res.values;
                this.loading = false;
                this.databaseService.closeConnection();
                // this.responseService.onSuccess('Auditorías recuperadas');
              }
            },
            error: err => {
              this.responseService.onError(err, 'No se pudieron recuperar las auditorías');
              this.databaseService.closeConnection();
              this.loading = false;
            }
          })
      });
  }

  onGoingHome() {
    this.router.navigateByUrl('/home');
  }

  onEdit(id: string) {
    this.router.navigateByUrl(`/auditory-form/${id}`);
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

}
