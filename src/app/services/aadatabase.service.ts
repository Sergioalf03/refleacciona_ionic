import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { BehaviorSubject, from, of, switchMap } from 'rxjs';

import { Device } from '@capacitor/device';
import { Storage } from '@ionic/storage-angular';
import { CapacitorSQLite } from '@capacitor-community/sqlite';

import * as database from '../../assets/databases/dump';

const DB_SETUP_KEY = 'first_db_setup';
const DB_NAME_KEY = 'db_name';

@Injectable({
  providedIn: 'root'
})
export class AADatabaseService {

  dbReady = new BehaviorSubject(false);
  dbName = '';

  private _storage: Storage | null = null;

  constructor(
    private http: HttpClient,
    private alertCtrl: AlertController) { }


  async init(): Promise<void> {
    const info = await Device.getInfo();

    if (info.platform === 'android') {
      try {
        const sqlite = CapacitorSQLite as any;
        await sqlite.requestPermissions();
        this.setupDatabase();
      } catch (e) {
        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: 'La aplicación no puede funcionar sin permiso de base de datos',
          buttons: ['OK']
        });
        await alert.present();
      }
    } else {
      this.setupDatabase();
    }
  }

  private async setupDatabase() {
    console.log('here')
    const dbSetupDone = await this._storage?.get(DB_SETUP_KEY);
    console.log(dbSetupDone)

    if (!dbSetupDone) {
      this.downloadDatabase();
    } else {
      this.dbName = (await this._storage?.get(DB_NAME_KEY)).value;
      await CapacitorSQLite.open({ database: this.dbName });
      this.dbReady.next(true);
    }
  }

  // Potentially build this out to an update logic:
  // Sync your data on every app start and update the device DB
  private async downloadDatabase(update = false) {
    console.log('here');
    // this.http
    //   .get('https://devdactic.fra1.digitaloceanspaces.com/tutorial/db.json')
    //   .subscribe(async (jsonExport: any) => {
        const jsonstring = JSON.stringify(database.dump);
        const isValid = await CapacitorSQLite.isJsonValid({ jsonstring });

        if (isValid.result) {
          this.dbName = database.dump.database;
          await this._storage?.set(DB_NAME_KEY, this.dbName);
          await CapacitorSQLite.importFromJson({ jsonstring });
          await this._storage?.set(DB_SETUP_KEY, '1');

          // Your potential logic to detect offline changes later
          if (!update) {
            await CapacitorSQLite.createSyncTable({});
          } else {
            await CapacitorSQLite.setSyncDate({ syncdate: '' + new Date().getTime() })
          }
          this.dbReady.next(true);
        }
  //     });
  }

  ngetProductList() {
    return this.dbReady.pipe(
      switchMap(isReady => {
        if (!isReady) {
          return of({ values: [] });
        } else {
          const statement = 'SELECT * FROM products;';
          return from(CapacitorSQLite.query({ statement, values: [] }));
        }
      })
    )
  }

  async getProductById(id: number) {
    const statement = `SELECT * FROM products LEFT JOIN vendors ON vendors.id=products.vendorid WHERE products.id=${id} ;`;

    const result = (await CapacitorSQLite?.query({ statement, values: [] }));

    return result.values ? result.values[0] : null;
  }

  getDatabaseExport(mode: any) {
    return CapacitorSQLite.exportToJson({ jsonexportmode: mode });
  }

  addDummyProduct(name: string) {
    const randomValue = Math.floor(Math.random() * 100) + 1;
    const randomVendor = Math.floor(Math.random() * 3) + 1
    const statement = `INSERT INTO products (name, currency, value, vendorid) VALUES ('${name}','EUR', ${randomValue}, ${randomVendor});`;
    return CapacitorSQLite.execute({ statements: statement });
  }

  deleteProduct(productId: number) {
    const statement = `DELETE FROM products WHERE id = ${productId};`;
    return CapacitorSQLite.execute({ statements: statement });
  }

  // For testing only..
  async deleteDatabase() {
    const dbName = await this._storage?.get(DB_NAME_KEY);
    await this._storage?.set(DB_SETUP_KEY, null);
    return CapacitorSQLite.deleteDatabase({ database: dbName.value });
  }
}
