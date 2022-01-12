import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TelemetryPageRoutingModule } from './telemetry-routing.module';

import { TelemetryPage } from './telemetry.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TelemetryPageRoutingModule
  ],
  declarations: [TelemetryPage]
})
export class TelemetryPageModule {}
