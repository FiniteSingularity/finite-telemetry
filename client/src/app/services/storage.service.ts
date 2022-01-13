import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private _storage: Storage | null = null;

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    if (this._storage != null) {
      return;
    }
    const storage = await this.storage.create();
    this._storage = storage;
  }

  public async set(key: string, value: any) {
    await this.init();
    return this._storage?.set(key, value);
  }

  public async get<T>(key: string, defaultValue: T = null): Promise<T> {
    await this.init();
    return (await this._storage?.get(key)) || defaultValue;
  }

  public async remove(key: string) {
    await this.init();
    return this._storage?.remove(key);
  }

  public async clear() {
    await this.init();
    return this._storage?.clear();
  }

  public async keys() {
    await this.init();
    return this._storage?.keys();
  }
}
