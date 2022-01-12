import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TelemetryPage } from './telemetry.page';

const routes: Routes = [
  {
    path: '',
    component: TelemetryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TelemetryPageRoutingModule {}
