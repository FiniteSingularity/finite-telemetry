import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SpeedometerComponent } from './overlays/speedometer/speedometer.component';
import { MaxSpeedComponent } from './overlays/max-speed/max-speed.component';
import { AltimeterComponent } from './overlays/altimeter/altimeter.component';
import { TheMeterComponent } from './overlays/the-meter/the-meter.component';

@NgModule({
  declarations: [
    AppComponent,
    SpeedometerComponent,
    MaxSpeedComponent,
    AltimeterComponent,
    TheMeterComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
