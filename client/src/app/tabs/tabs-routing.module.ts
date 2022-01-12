import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'twitch',
        loadChildren: () => import('../twitch/twitch.module').then( m => m.TwitchPageModule)
      },
      {
        path: 'telemetry',
        loadChildren: () => import('../telemetry/telemetry.module').then( m => m.TelemetryPageModule)
      },
      {
        path: 'stream',
        loadChildren: () => import('../stream/stream.module').then( m => m.StreamPageModule)
      },
      {
        path: '',
        redirectTo: '/tabs/twitch',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/twitch',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
