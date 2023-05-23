import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MapService {

  locationBs = new BehaviorSubject<{lat: number, lng: number}>({lat: 0, lng: 0})

  constructor() { }

  setCenter(lat: number, lng: number) {
    this.locationBs.next({lat, lng});
  }

  getCenter() {
    return this.locationBs.asObservable();
  }
}
