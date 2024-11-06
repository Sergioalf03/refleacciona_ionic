import { Injectable } from '@angular/core';

import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private _storage: Storage | null = null;

  constructor(private storage: Storage) { }

  async init(storage: any) {
    this._storage = await storage;

    return true;
  }

  public set(key: string, value: any) {
    this._storage?.set(key, value);
  }

  public async get(key: string) {
    return await this._storage?.get(key);
  }

  public async exists(key: string) {
    return await !!this._storage?.get(key);
  }

  public async remove(key: string) {
    await this._storage?.remove(key);
  }

}
