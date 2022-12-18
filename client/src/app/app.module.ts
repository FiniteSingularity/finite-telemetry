import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage-angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        HttpClientModule,
        IonicModule.forRoot(),
        IonicStorageModule.forRoot(),
        AppRoutingModule,
    ],
    providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
    bootstrap: [AppComponent]
})
export class AppModule {}
