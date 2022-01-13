import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SettingsPageRoutingModule } from './settings-routing.module';

import { SettingsPage } from './settings.page';
import { SetupTauComponent } from './components/setup-tau/setup-tau.component';
import { SetupTelemetryComponent } from './components/setup-telemetry/setup-telemetry.component';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, SettingsPageRoutingModule],
  declarations: [SettingsPage, SetupTauComponent, SetupTelemetryComponent],
})
export class SettingsPageModule {}
