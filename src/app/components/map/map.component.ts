import { AfterViewInit, Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { Subscription } from 'rxjs';
import { MapService } from 'src/app/core/controllers/map.service';
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit, AfterViewInit {

  private map!: L.Map;

  private async initMap(): Promise<any> {
    const coordinates = await Geolocation.getCurrentPosition();

    this.map = L.map('map', {
      center: [coordinates.coords.latitude, coordinates.coords.longitude],
      zoom: 16
    });

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 3,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    tiles.addTo(this.map);
  }

  centerSubscription!: Subscription;

  constructor(
    private mapService: MapService,
  ) { }

  ngOnInit() {
    this.centerSubscription = this.mapService
      .getCenter()
      .subscribe({
        next: coords => coords.lat !== 0 && coords.lng !== 0 && this.map.flyTo(L.latLng(coords.lat, coords.lng), 17)
      });
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

}
