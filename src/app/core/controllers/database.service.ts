import { Injectable } from '@angular/core';
import { SQLiteService } from './sqlite.service';
import { LOCAL_DATABASE } from 'src/environments/environment';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { createSchema, loadData } from 'src/app/utils/database.util';
import { BehaviorSubject, Observable, from, } from 'rxjs';
import { map, take, tap, } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  constructor(
    private _sqlite: SQLiteService,
  ) { }

  async checkDatabaseVersion() {
    const result = new Promise((res, rej) => {
      this.executeQuery('SELECT * FROM versions ORDER BY id DESC LIMIT 1;')
        .subscribe(result => {
          if (result !== 'waiting') {
            if (result.includes && result.includes('no such table: versions')) {
              this.createDatabase();
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
    const data = new BehaviorSubject<any>('waiting');
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

    return data.asObservable().pipe(take(2));
  }

  private async sendQuery(connection: SQLiteDBConnection, query: string, data: BehaviorSubject<any>) {
    await connection.open();

    connection?.query(query)
      .then(async (result) => {
        connection
          .close()
          .then(async () => {
            data.next(result);
          });
      })
      .catch(async (e) => {
        connection
          .close()
          .then(async () => {
            data.next(`error: ${e.message}`);
          });
      });
  }

  private async createDatabase() {
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
            await connection.close();
          })
          .catch(async (e) => {
            await connection.close();
          });
      })
      .catch(async (e) => {
        await connection.close();
      });
  }
}
