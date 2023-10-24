import { Injectable } from '@angular/core';
import { SQLiteService } from './sqlite.service';
import { LOCAL_DATABASE } from 'src/environments/environment';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { createSchema, loadData } from 'src/app/utils/database.util';
import { BehaviorSubject, Observable, from, } from 'rxjs';
import { take, tap, } from 'rxjs/operators';
import { DATABASE_WAITING_MESSAGE } from '../constants/message-code';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  constructor(
    private _sqlite: SQLiteService,
  ) { }

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
    console.log(query);
    const data = new BehaviorSubject<any>(DATABASE_WAITING_MESSAGE);
    this._sqlite
      .createConnection(LOCAL_DATABASE.name, LOCAL_DATABASE.encrypted, LOCAL_DATABASE.mode, LOCAL_DATABASE.version)
      .then(async connection => {
        this.sendQuery(connection, query, data);
      })
      .catch(async err => {
        this._sqlite
          .retrieveConnection(LOCAL_DATABASE.name)
          .then(async connection => {
            this.sendQuery(connection, query, data);
          })
          .catch(() => {
            this._sqlite
              .createConnection(LOCAL_DATABASE.name, LOCAL_DATABASE.encrypted, LOCAL_DATABASE.mode, LOCAL_DATABASE.version)
              .then(async connection => {
                this.sendQuery(connection, query, data);
              })
          });
      });

    return data.asObservable().pipe(tap(r => console.log(r)),take(2));
  }

  private async sendQuery(connection: SQLiteDBConnection, query: string, data: BehaviorSubject<any>) {
    await connection.open();

    connection?.query(query)
      .then(async (result) => {
        await connection.isExists() ? connection
          .close()
          .then(async () => {
            data.next(result);
          }).catch(e => console.log(e)) : true;
      })
      .catch(async (e) => {
        await connection.isExists() ? connection
          .close()
          .then(async () => {
            data.next(`error: ${e.message}`);
          }).catch(e => console.log(e)) : true;
      });
  }

  public async createDatabase() {
    this._sqlite
      .createConnection(LOCAL_DATABASE.name, LOCAL_DATABASE.encrypted, LOCAL_DATABASE.mode, LOCAL_DATABASE.version)
      .then(async connection => {
        this.sendCreateDatabase(connection);
      })
      .catch(async err => {
        this._sqlite
          .retrieveConnection(LOCAL_DATABASE.name)
          .then(async connection => {
            this.sendCreateDatabase(connection);
          });
      });
  }

  private async sendCreateDatabase(connection: SQLiteDBConnection,) {
    await connection.open();
    connection.execute(createSchema)
      .then(result => {
        connection.execute(loadData)
          .then(async (result1) => {
            console.log('creation result', result1)
            await connection.close().catch(e => console.log(e));
          })
          .catch(async (e) => {
            await connection.close().catch(e => console.log(e));
          });
      })
      .catch(async (e) => {
        await connection.close().catch(e => console.log(e));
      });
  }
}
