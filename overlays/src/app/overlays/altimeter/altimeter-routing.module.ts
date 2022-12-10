import { Routes } from '@angular/router';
import { AltimeterComponent } from './altimeter.component';

export const AltimeterRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: AltimeterComponent,
  },
];
