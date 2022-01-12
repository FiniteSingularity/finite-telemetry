import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TwitchPageRoutingModule } from './twitch-routing.module';

import { TwitchPage } from './twitch.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TwitchPageRoutingModule
  ],
  declarations: [TwitchPage]
})
export class TwitchPageModule {}
