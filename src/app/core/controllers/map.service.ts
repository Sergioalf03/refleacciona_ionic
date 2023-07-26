import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MapService {

  locationBs = new BehaviorSubject<{lat: number, lng: number, static: boolean}>({lat: 0, lng: 0, static: false})
  removeMapBS = new BehaviorSubject<string>('no');

  constructor() { }

  setCenter(lat: number, lng: number, sttc?: boolean) {
    this.locationBs.next({ lat, lng, static: !!sttc });
  }

  getCenter() {
    return this.locationBs.asObservable();
  }

  removeMap() {
    this.removeMapBS.next('yes');
    this.removeMapBS.next('no');
  }

  getRemovemap() {
    return this.removeMapBS.asObservable();
  }

}
