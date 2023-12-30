import { CUSTOM_ELEMENTS_SCHEMA, NgModule, Optional } from '@angular/core';
import { BrowserModule, EVENT_MANAGER_PLUGINS, HAMMER_LOADER } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { IonicStorageModule } from '@ionic/storage-angular';
import { TokenInterceptorService } from './core/controllers/token-interceptor.service';
import { ErrorInterceptorService } from './core/controllers/error-interceptor.service';

import { SQLiteService } from './core/controllers/sqlite.service';

import { HammerGestureConfig, HAMMER_GESTURE_CONFIG,  } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { Console } from 'console';

import * as Hammer from 'hammerjs';

  export class HammerConfig extends HammerGestureConfig {
    override overrides = <any>{
      'swipe': { direction: Hammer.DIRECTION_ALL }
    };
  }
@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(),
    IonicStorageModule.forRoot(),
    AppRoutingModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptorService, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptorService, multi: true },
    SQLiteService,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: HammerConfig
    }
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
