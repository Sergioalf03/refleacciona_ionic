import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController } from '@ionic/angular';
import { Observable, Subscription } from 'rxjs';
import { URI_AUDITORY_DETAIL, URI_AUDITORY_FORM, URI_HELMET_FORM, URI_QUESTION_FORM } from 'src/app/core/constants/uris';

@Component({
  selector: 'app-generic-list',
  templateUrl: './generic-list.component.html',
  styleUrls: ['./generic-list.component.scss'],
})
export class GenericListComponent implements OnInit {

  @Input() title!: string;
  @Input() type!: number;
  @Input() listObservable!: Observable<{ list: any[], type: number }>;
  @Input() service: any;
  @Input() delete: any;
  @Input() upload: any;
  @Input() editGeneral: any;
  @Input() editValues: any;
  @Input() create: any;
  @Input() detail: any;
  @Input() descrciption: any;

  list: any[] = [];

  sendedList = false;

  showProfileHeader = false;

  generalEditUrl!: any;
  contentEditUrl!:any;
  detailUrl!: any;

  listSubscription!: Subscription;

  constructor(
    private actionSheetCtrl: ActionSheetController,
  ) { }

  ngOnInit() {
    this.listSubscription = this.listObservable
      .subscribe({
        next: data => {
          this.list = data.list;
          this.sendedList = data.type === 2;
        },
      });
    this.showProfileHeader = true;

    switch (this.type) {
      case 0:
        this.generalEditUrl = URI_AUDITORY_FORM;
        this.contentEditUrl = URI_QUESTION_FORM;
        this.detailUrl = URI_AUDITORY_DETAIL;
        break;
    }
  }

  ngOnDestroy() {
    this.showProfileHeader = false;

  }

  async presentActionSheetOptions(element: any) {
    console.log(element)
    const buttons = [
      {
        text: 'Actualizar contenido',
        handler: () => this.editValues(element.id),
      },
      {
        text: 'Actualizar datos generales',
        handler: () => this.editGeneral(element.id),
      },
      {
        text: 'Eliminar',
        role: 'destructive',
        handler: () => this.delete(element.id),
      },
      {
        text: 'Cerrar',
        role: 'cancel',
        data: {
          action: 'cancel',
        },
      },
    ];

    if (element.statusWord === "Terminada") {
      buttons.unshift({
        text: 'Subir',
        handler: () => this.upload(element.id),
      });
    }

    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Opciones',
      mode: 'ios',
      buttons: buttons,
    });

    await actionSheet.present();
  }



}
