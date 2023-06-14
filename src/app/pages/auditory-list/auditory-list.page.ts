import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
    private router: Router,
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.loading = true;
    this.auditoryService
      .getLocalList()
      .subscribe({
        next: res => {
          console.log(res)
          this.auditories = res.values;
          this.loading = false;
          this.responseService.onSuccess('Auditorías recuperadas');
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

  onDelete(id: string) {
    this.loading = true;
    this.auditoryService
      .deleteLocal(id)
      .subscribe({
        next: () => {
          this.loading = false;
          this.responseService.onSuccess('Auditoría eliminada');
          this.ionViewWillEnter();
        },
        error: err => {
          this.responseService.onError(err, 'No se pudo eliminar la auditoría');
          this.loading = false;
        }
      })
  }

}
