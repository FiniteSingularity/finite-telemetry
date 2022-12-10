import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TelemetryPageRoutingModule } from './telemetry-routing.module';

import { TelemetryPage } from './telemetry.page';
import { UpdateAltitudeComponent } from './components/update-altitude/update-altitude.component';
import { ResetOverlayComponent } from './components/reset-overlay/reset-overlay.component';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, TelemetryPageRoutingModule],
  declarations: [TelemetryPage, UpdateAltitudeComponent, ResetOverlayComponent],
})
export class TelemetryPageModule {}
