import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SpeedometerRoutes } from './speedometer-routing.module';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(SpeedometerRoutes),
  ]
})
export class SpeedometerModule { }
