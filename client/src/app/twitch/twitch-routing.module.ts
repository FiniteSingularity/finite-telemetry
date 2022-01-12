import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TwitchPage } from './twitch.page';

const routes: Routes = [
  {
    path: '',
    component: TwitchPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TwitchPageRoutingModule {}
