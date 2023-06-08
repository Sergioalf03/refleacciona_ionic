import { Injectable } from '@angular/core';
import { SQLiteService } from './sqlite.service';
import { LOCAL_DATABASE } from 'src/environments/environment';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { createSchema, loadData } from 'src/app/utils/database.util';
import { Observable, from, of } from 'rxjs';

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

    return this.db.open();
  }

  async checkDatabaseVersion() {
    try {
      const result = await this.db?.query('SELECT * FROM versions;');
      if (result?.values?.length === 0) {
        this.loadInitialData();
      }
      // verificar nuevas versiones en el backend
    } catch (err: any) {
      if (err.message.includes('no such table: versions')) {
        this.createDatabase();
      }
    }
  }

  executeQuery(query: string): Observable<any> {
    return from(this.db?.query(query) || new Promise((res, rej) => true));
  }

  private async loadInitialData() {
    console.log('loading data')
    const result = await this.db?.query(loadData);
    if (!!result) {
      this.checkDatabaseVersion();
    }
  }

  private async createDatabase() {
    console.log('creating database')
    const result = await this.db?.execute(createSchema);
    if (!!result) {
      this.checkDatabaseVersion();
    }
  }
}
