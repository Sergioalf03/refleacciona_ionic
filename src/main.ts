import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { defineCustomElements as jeepSqlite } from 'jeep-sqlite/loader';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { Capacitor } from '@capacitor/core';


if (environment.production) {
  enableProdMode();
}

const platform = Capacitor.getPlatform();
     if(platform === "web") {


         // required for jeep-sqlite Stencil component
         // to use a SQLite database in Browser
         jeepSqlite(window);

         window.addEventListener('DOMContentLoaded', async () => {
             const jeepEl = document.createElement("jeep-sqlite");
             document.body.appendChild(jeepEl);
             await customElements.whenDefined('jeep-sqlite');
             jeepEl.autoSave = true;
         });
     }




platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
