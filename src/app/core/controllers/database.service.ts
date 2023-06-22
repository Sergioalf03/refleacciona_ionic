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

  private db?: SQLiteDBConnection;

  constructor(
    private _sqlite: SQLiteService,
  ) { }

  async initConnection() {
    this.db = await this._sqlite
      .createConnection(LOCAL_DATABASE.name, LOCAL_DATABASE.encrypted, LOCAL_DATABASE.mode, LOCAL_DATABASE.version);

    await this.db.open();

    // this.createDatabase();
  }

  closeConnection() {
    if (this.db) {
      this._sqlite.closeConnection(LOCAL_DATABASE.name);
      this.db = undefined;
    }
  }

  async checkDatabaseVersion() {
    this.executeQuery('SELECT * FROM versions;')
      .subscribe(res => {
        if (res !== 'waiting') {
          console.log(res);
          if (res.includes && res.includes('no such table: versions')) {
            this.createDatabase();
          }
        }
      });
  }

  executeQuery(query: string): Observable<any> {
    const data = new BehaviorSubject<any>('waiting');

    this._sqlite
      .createConnection(LOCAL_DATABASE.name, LOCAL_DATABASE.encrypted, LOCAL_DATABASE.mode, LOCAL_DATABASE.version)
      .then(async connection => {
        await connection.open();

        connection?.query(query)
          .then(result => {
            console.log(result)
            data.next(result);
            connection.close();
          })
          .catch(e => {
            console.log(e)
            connection.close();
            data.next(`error: ${e.message}`);
          });
      });



    return data.asObservable().pipe(take(2));
  }

  private async createDatabase() {
    this._sqlite
      .createConnection(LOCAL_DATABASE.name, LOCAL_DATABASE.encrypted, LOCAL_DATABASE.mode, LOCAL_DATABASE.version)
      .then(async connection => {
        await connection.open();
        connection.execute(createSchema)
          .then(result => {
            console.log(result);
            connection.execute(loadData)
            .then(result1 => {
                console.log(result1);
                connection.close();
              })
              .catch(e => {
                console.log(`error: ${e.message}`);
                connection.close();
              });
          })
          .catch(e => {
            console.log(`error: ${e.message}`);
            connection.close();
          });
      });
  }
}
