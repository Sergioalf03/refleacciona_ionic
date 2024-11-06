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
    private sqliteService: SQLiteService,
    private responseService: HttpResponseService,
  ) { }

 async createConnection() {

   return new Promise(async (resolve, reject) => {
      this.connection = await this.sqliteService.openDatabase(
        LOCAL_DATABASE.name,
        LOCAL_DATABASE.encrypted,
        LOCAL_DATABASE.mode,
        LOCAL_DATABASE.version,
        false
      );

      resolve(true);
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
    console.log('Inicio de ejecución de query')
    if (this.connection) {
      console.log('conexión definida')
      await this.connection
        .open()
        .then(() => {
          console.log('conexión abierta');

          this.connection.query(query)
            .then(async (result) => {
              await this.connection
                .isDBOpen()
                .then(c => {
                  console.log('conexión abierta? ', c)
                  this.connection
                    .close()
                    .then(async () => {
                      data.next(result);
                    })
                    .catch((e: any) => {
                      data.next('unclosed');
                    })
                })
                .catch((e: any) => console.log('Errro al verificar conexión abierta ', e));
            })
            .catch(async (e) => {
              await this.connection.isDBOpen()
                .then(c => {
                  this.connection
                    .close()
                    .then(async () => {
                      data.next(`error: ${e.message}`);
                    })
                    .catch((e: any) => {
                      data.next('unclosed');
                    });
                })
                .catch((e: any) => console.log(e));
            });
        })
        .catch((e: any) => {
          console.log('Conexión no se pudo abrir 4', e);
        });

    } else {
      console.log('conexión no definida');
    }
  }

  public async createDatabase() {
    console.log('inicia creación de base de datos')
    await this.connection
      .open()
      .then(() => {
        console.log('Conexión abierta')
        this.connection
          .execute(createSchema)
          .then(result => {
            console.log('Base de datos creada')
            this.connection
              .execute(loadData)
              .then(async (result1) => {
                console.log('Datos cargados')
                await this.connection
                  .close()
                  .then(() => console.log('Base de datos cerrada 1'))
                  .catch((e: any) => this.responseService.onError(e, 'No se pudo cerrar la base de datos 1'));
              })
              .catch(async (e1) => {
                console.log('error al cargar datos: ', e1)
                await this.connection
                  .close()
                  .then(() => console.log('Base de datos cerrada 2'))
                  .catch((e: any) => this.responseService.onError(e, 'No se pudo cerrar la base de datos 2'));
              });
          })
          .catch(async (e) => {
            console.log('Error al crear base de datos: ', e)
            await this.connection
              .close()
              .then(() => console.log('Base de datos cerrada 3'))
              .catch((e: any) => this.responseService.onError(e, 'No se pudo cerrar la base de datos 3'));
          });
      })
      .catch((e: any) => {
        console.log('Error Al abrir la conexión', e)
      });
  }

}
