import { Routes } from '@angular/router';
import { TheMeterComponent } from './the-meter.component';

export const TheMeterRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: TheMeterComponent,
  },
];
