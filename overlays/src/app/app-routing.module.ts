import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'overlays/speedometer',
    loadChildren: () =>
      import('./overlays/speedometer/speedometer.module').then(
        (mod) => mod.SpeedometerModule
      ),
  },
  {
    path: 'overlays/max-speed',
    loadChildren: () =>
      import('./overlays/max-speed/max-speed.module').then(
        (mod) => mod.MaxSpeedModule
      ),
  },
  {
    path: 'overlays/altimeter',
    loadChildren: () =>
      import('./overlays/altimeter/altimeter.module').then(
        (mod) => mod.AltimeterModule
      ),
  },
  {
    path: 'overlays/the-meter',
    loadChildren: () =>
      import('./overlays/the-meter/the-meter.module').then(
        (mod) => mod.TheMeterModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
