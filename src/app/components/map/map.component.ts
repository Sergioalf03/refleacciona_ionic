import { AfterViewInit, Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
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

  @Output() centerEvent = new EventEmitter<any>();

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

    this.map
    .on('dblclick', () => this.setCoords())
    .on('moveend', () => this.setCoords())
    .on('zoomend', () => this.setCoords());

    tiles.addTo(this.map);
    this.setCoords();
  }

  centerSubscription!: Subscription;

  constructor(
    private mapService: MapService,
  ) { }

  ngOnInit() {
    // this.map.remove();
    this.centerSubscription = this.mapService
      .getCenter()
      .subscribe({
        next: coords => {
          if (coords.lat !== 0 && coords.lng !== 0){
            this.map.flyTo(L.latLng(coords.lat, coords.lng), 17)
          } else {
            if (this.map) {
              this.map.off();
              this.map.remove();
            }
          }
        }
      });
  }

  ngAfterViewInit(): void {
    if (!this.map) {
      this.initMap();
    }
  }

  private setCoords() {
    if (this.map) {
      const coords = this.map.getCenter();
      console.log(coords)
      this.centerEvent.emit({ lat: coords.lat, lng: coords.lng })
    }
  }

}
