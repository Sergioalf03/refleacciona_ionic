import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, OnDestroy, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
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

  @ViewChild('map')
  private mapElement!: ElementRef;

  private map!: L.Map;


  private async initMap(): Promise<any> {
    const coordinates = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });

    this.map = L.map(this.mapElement.nativeElement, {
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
  removeMapSubscription!: Subscription;

  constructor(
    private mapService: MapService,
    private renderer: Renderer2,
  ) { }

  ngOnInit() {
    this.centerSubscription = this.mapService
      .getCenter()
      .subscribe({
        next: coords => {
          console.log(this.map);
          if (coords.lat !== 0 && coords.lng !== 0){
            this.map.flyTo(L.latLng(coords.lat, coords.lng), 17).on('moveend', () => {
              if (coords.static) {
                this.map.dragging.disable();
                this.map.touchZoom.disable();
                this.map.doubleClickZoom.disable();
                this.map.scrollWheelZoom.disable();
                this.map.boxZoom.disable();
                this.map.keyboard.disable();
                if (this.map.tap) this.map.tap.disable();
              }
            })
          } else {
            this.removeMap();
          }
        }
      });
  }

  private removeMap() {
    console.log('here');
    if (this.map) {
      this.map.off();
      this.map.remove();
    }
  }

  ionviewWillLeave() {
    console.log('leave')
    this.centerSubscription.unsubscribe();
  }

  ngAfterViewInit(): void {
    if (!this.map) {
      this.initMap();
    }
  }

  private setCoords() {
    if (this.map) {
      const coords = this.map.getCenter();
      this.centerEvent.emit({ lat: coords.lat, lng: coords.lng })
    }
  }

}
