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
    console.log('version query');
    this.executeQuery('SELECT * FROM versions;')
    .subscribe(res => {
      if (res !== 'waiting') {
          console.log('version result');
          console.log(res);
          if (res.includes && res.includes('no such table: versions')) {
            console.log('createdatabase');
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
        this.sendQuery(connection, query, data);
      })
      .catch(async err => {
        console.log('ya existe la conexión', err)
        this._sqlite
          .retrieveConnection(LOCAL_DATABASE.name)
          .then(async connection => {
            this.sendQuery(connection, query, data);
          })
          .catch(() => {
            console.log('no existe la conexión')
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
    console.log('open');
    await connection.open();

    connection?.query(query)
      .then(async (result) => {
        console.log(result)
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
        console.log(e)
      });
  }

  private async createDatabase() {
    console.log('createdatabase start');
    this._sqlite
      .createConnection(LOCAL_DATABASE.name, LOCAL_DATABASE.encrypted, LOCAL_DATABASE.mode, LOCAL_DATABASE.version)
      .then(async connection => {
        this.sendCreateDatabase(connection);
      })
      .catch(async err => {
        console.log('connection error', err)
        this._sqlite
          .retrieveConnection(LOCAL_DATABASE.name)
          .then(async connection => {
            this.sendCreateDatabase(connection);
          });
      });
  }

  private async sendCreateDatabase(connection: SQLiteDBConnection,) {
    await connection.open();
    console.log('connection open');
    console.log('schema');
    connection.execute(createSchema)
      .then(result => {
        console.log('schemaresult');
        console.log(result);
        console.log('loaddata');
        connection.execute(loadData)
          .then(async (result1) => {
            console.log('loaddataresult');
            console.log(result1);
            await connection.close();
          })
          .catch(async (e) => {
            console.log('loaddataerror');
            console.log(`error: ${e.message}`);
            await connection.close();
          });
      })
      .catch(async (e) => {
        console.log('schemaerror');
        console.log(`error: ${e.message}`);
        await connection.close();
      });
  }
}
