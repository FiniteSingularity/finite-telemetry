import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AltimeterRoutes } from './altimeter-routing.module';

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(AltimeterRoutes)],
})
export class AltimeterModule {}
