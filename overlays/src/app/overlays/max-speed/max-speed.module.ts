import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaxSpeedRoutes } from './max-speed-routing.module';

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(MaxSpeedRoutes)],
})
export class MaxSpeedModule {}
