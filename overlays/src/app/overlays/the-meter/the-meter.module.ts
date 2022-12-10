import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TheMeterRoutes } from './the-meter-routing.module';

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(TheMeterRoutes)],
})
export class TheMeterModule {}
