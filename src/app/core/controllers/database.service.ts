import { Injectable } from '@angular/core';
import { SQLiteService } from './sqlite.service';
import { LOCAL_DATABASE } from 'src/environments/environment';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { createSchema, loadData } from 'src/app/utils/database.util';
import { BehaviorSubject, Observable, from, } from 'rxjs';
import { take, tap, } from 'rxjs/operators';
import { DATABASE_WAITING_MESSAGE } from '../constants/message-code';
import { HttpResponseService } from './http-response.service';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  connection!: SQLiteDBConnection;

  constructor(
    private _sqlite: SQLiteService,
    private responseService: HttpResponseService,
  ) { }

  createConnection() {
    return new Promise((resolve, reject) => {
      this._sqlite
        .createConnection(LOCAL_DATABASE.name, LOCAL_DATABASE.encrypted, LOCAL_DATABASE.mode, LOCAL_DATABASE.version)
        .then(newConnection => {
          this.connection = newConnection;
          console.log('Conexión creada');
          resolve(true);
        })
        .catch(err => {
          console.log('No se pudo crear la conexión: ' + err);
          resolve(false);
        });
    });
  }

  openConnection() {
    return new Promise((resolve, reject) =>  {
      this.connection
        .open()
        .then(() => {
          console.log('Conexión abierta');
          resolve(true);
        })
        .catch(err => {
          console.log('No se pudo abrir la conexión: ' + err);
          resolve(false);
        });
    });
  }

  closeConnection() {
    return new Promise((resolve, reject) => {
      if (!!this.connection) {
        this.connection
          .close()
          .then(() => {
            console.log('Conexión cerrada');
            resolve(true);
          })
          .catch(err => {
            console.log('No se pudo cerrar la conexión: ' + err);
            resolve(false);
          });
      }
    });
  }

  deleteConnection() {
    return new Promise((resolve, reject) => {
      if (!!this.connection) {
        this.connection
          .delete()
          .then(() => {
            console.log('Conexión eliminada');
            resolve(true);
          })
          .catch(err => {
            console.log('No se pudo eliminar la conexión: ' + err);
            resolve(false);
          });
      }
    });
  }

  async checkDatabaseVersion() {
    const result = new Promise((res, rej) => {
      this.executeQuery('SELECT * FROM versions ORDER BY id DESC ;')
        .subscribe(async result => {
          if (result !== DATABASE_WAITING_MESSAGE) {
            if (result.includes && result.includes('no such table: versions')) {
              await this.createDatabase();
              res('new')
            } else {
              res(result)
            }
          }
        });
    });

    return result;
  }

  executeQuery(query: string): Observable<any> {
    const data = new BehaviorSubject<any>(DATABASE_WAITING_MESSAGE);

    this.sendQuery(query, data);

    return data.asObservable().pipe(take(2));
  }

  private async sendQuery(query: string, data: BehaviorSubject<any>) {
    await this.connection.open();

    this.connection?.query(query)
      .then(async (result) => {
        await this.connection.isDBOpen()
          .then(c => {
            this.connection
              .close()
              .then(async () => {
                data.next(result);
              })
              .catch(e => {
                data.next('unclosed');
              })
          })
          .catch(e => console.log(e));
      })
      .catch(async (e) => {
        await this.connection.isDBOpen()
          .then(c => {
            this.connection
              .close()
              .then(async () => {
                data.next(`error: ${e.message}`);
              })
              .catch(e => {
                data.next('unclosed');
              });
          })
          .catch(e => console.log(e));
      });
  }

  public async createDatabase() {
    await this.connection.open();
    this.connection
      .execute(createSchema)
      .then(result => {
        this.connection
          .execute(loadData)
          .then(async (result1) => {
            await this.connection
              .close()
              .then(() => true)
              .catch(e => this.responseService.onError(e, 'No se pudo crear la base de datos'));
          })
          .catch(async (e) => {
            await this.connection
              .close()
              .then(() => true)
              .catch(e => this.responseService.onError(e, 'No se pudo crear la base de datos'));
          });
      })
      .catch(async (e) => {
        await this.connection
          .close()
          .then(() => true)
          .catch(e => this.responseService.onError(e, 'No se pudo crear la base de datos'));
      });
  }

}
