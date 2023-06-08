import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpResponseService } from 'src/app/core/controllers/http-response.service';
import { SessionService } from 'src/app/core/controllers/session.service';
import { AuditoryService } from 'src/app/services/auditory.service';
import { DatabaseService } from 'src/app/core/controllers/database.service';
import { SQLiteService } from 'src/app/core/controllers/sqlite.service';
import { timeout } from 'rxjs';
import { QuestionService } from 'src/app/services/question.service';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
})
export class InicioPage implements OnInit, AfterViewInit {

  auditoriesCount = 0;

  sqlite: any;
  platform?: string;
  handlerPermissions: any;
  initPlugin: boolean = false;

  constructor(
    private auditoryService: AuditoryService,
    private sessionService: SessionService,
    private httpResponseService: HttpResponseService,
    private databaseService: DatabaseService,
    private questionService: QuestionService,
    private router: Router,
  ) { }

  ngOnInit() {

  }

  ionViewDidEnter() {
    this.auditoryService
      .getCount()
      .subscribe({
        next: res => {
          this.auditoriesCount = res.data;
          this.httpResponseService.onSuccess('Información recuperada')
        },
        error: err => this.httpResponseService.onError(err, 'No se pudo recuperar la información'),
      });

    // this.databaseService.ngetProductList().subscribe({
    //   next: (res: any) => console.log(res),
    //   error: (err: any) => console.log(err),
    // })
  }

  async onLogout() {
    return await this.sessionService.logout()
    .subscribe({
      next: (res:any) => {
        console.log(res);
        this.httpResponseService.onSuccessAndRedirect('/login', 'Sesión cerrada');
      },
      error: err => {
        this.httpResponseService.onError(err, '');
      },
    })
  }

  onNewAuditory() {
    this.router.navigateByUrl('/auditory-form/0')
  }

  onAuditoryList() {
    this.router.navigateByUrl('/auditory-list')
  }

  async ngAfterViewInit() {
  }

  // async runTest(): Promise<void> {
  //   try {


  //     // create tables in db
  //     let ret: any = null;
  //     // console.log('$$$ ret.changes.changes in db ' + ret.changes.changes);
  //     // if (ret.changes.changes < 0) {
  //     //   return Promise.reject(new Error('Execute createSchema failed'));
  //     // }

  //     // create synchronization table
  //     // ret = await db.createSyncTable();
  //     // console.log(ret);
  //     // if (ret.changes.changes < 0) {
  //     //   return Promise.reject(new Error('Execute createSyncTable failed'));
  //     // }

  //     // set the synchronization date
  //     // const syncDate: string = new Date().toISOString();
  //     // await db.setSyncDate(syncDate);
  //     // console.log(syncDate);

  //     // add two users in db
  //     // ret = await db.execute(twoUsers);
  //     // console.log(ret);
  //     // if (ret.changes.changes !== 2) {
  //     //   return Promise.reject(new Error('Execute twoUsers failed'));
  //     // }
  //     // select all users in db
  //     ret = await db.query('SELECT * FROM users;');
  //     console.log(ret.values)
  //     // if (
  //     //   ret.values.length !== 2 ||
  //     //   ret.values[0].name !== 'Whiteley' ||
  //     //   ret.values[1].name !== 'Jones'
  //     // ) {
  //     //   return Promise.reject(new Error('Query1 twoUsers failed'));
  //     // }

  //     // select users where company is NULL in db
  //     ret = await db.query('SELECT * FROM users WHERE company IS NULL;');
  //     console.log(ret.values)
  //     // if (
  //     //   ret.values.length !== 2 ||
  //     //   ret.values[0].name !== 'Whiteley' ||
  //     //   ret.values[1].name !== 'Jones'
  //     // ) {
  //     //   return Promise.reject(
  //     //     new Error('Query2 Users where Company null failed'),
  //     //   );
  //     // }
  //     // add one user with statement and values
  //     let sqlcmd: string = 'INSERT INTO users (name,email,age) VALUES (?,?,?)';
  //     let values: Array<any> = ['Simpson', 'Simpson@example.com', 69];
  //     ret = await db.run(sqlcmd, values);



  //     // if (ret.changes.lastId !== 3) {
  //     //   return Promise.reject(new Error('Run1 add 1 User failed'));
  //     // }
  //     // add one user with statement
  //     // sqlcmd =
  //     //   `INSERT INTO users (name,email,age) VALUES ` +
  //     //   `("Brown","Brown@example.com",15)`;
  //     // ret = await db.run(sqlcmd);
  //     // ret = await db.query('SELECT * FROM users;');
  //     // console.log(ret.values)
  //     // if (ret.changes.lastId !== 4) {
  //     //   return Promise.reject(new Error('Run2 add 1 User failed'));
  //     // }

  //     await this._sqlite.closeConnection('testEncryption');

  //     // ************************************************
  //     // Encrypt the existing database
  //     // ************************************************

  //     // initialize the connection
  //     db = await this._sqlite.createConnection(
  //       'testEncryption',
  //       true,
  //       'encryption',
  //       1,
  //     );

  //     // open db testEncryption
  //     await db.open();
  //     // close the connection
  //     await this._sqlite.closeConnection('testEncryption');
  //     console.log('closeConnection encrypted ');
  //     // ************************************************
  //     // Work with the encrypted  database
  //     // ************************************************

  //     // initialize the connection
  //     db = await this._sqlite.createConnection(
  //       'testEncryption',
  //       true,
  //       'secret',
  //       1,
  //     );

  //     // open db testEncryption
  //     await db.open();

  //     // add one user with statement and values
  //     sqlcmd = 'INSERT INTO users (name,email,age) VALUES (?,?,?)';
  //     values = ['Jackson', 'Jackson@example.com', 32];
  //     ret = await db.run(sqlcmd, values);
  //     // if (ret.changes.lastId !== 5) {
  //     //   return Promise.reject(new Error('Run3 add 1 User failed'));
  //     // }

  //     // select all users in db
  //     ret = await db.query('SELECT * FROM users;');
  //     console.log('query encrypted ' + ret.values.length);
  //     console.log(ret.values);
  //     // if (
  //     //   ret.values.length !== 5 ||
  //     //   ret.values[0].name !== 'Whiteley' ||
  //     //   ret.values[1].name !== 'Jones' ||
  //     //   ret.values[2].name !== 'Simpson' ||
  //     //   ret.values[3].name !== 'Brown' ||
  //     //   ret.values[4].name !== 'Jackson'
  //     // ) {
  //     //   return Promise.reject(new Error('Query3  5 Users failed'));
  //     // }

  //     // delete it for multiple successive tests
  //     // await deleteDatabase(db);

  //     await this._sqlite.closeConnection('testEncryption');

  //     return Promise.resolve();
  //   } catch (err) {
  //     return Promise.reject(err);
  //   }
  // }

}
