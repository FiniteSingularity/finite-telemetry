import { Component } from '@angular/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { ModalController } from '@ionic/angular';
import { map } from 'rxjs';
import { TelemetryService } from '../services/telemetry.service';
import { ResetOverlayComponent } from './components/reset-overlay/reset-overlay.component';
import { UpdateAltitudeComponent } from './components/update-altitude/update-altitude.component';

@Component({
  selector: 'app-telemetry',
  templateUrl: './telemetry.page.html',
  styleUrls: ['./telemetry.page.scss'],
  //changeDetection: ChangeDetectionStrategy.OnPush
})
export class TelemetryPage {
  // that's what you're supposed to do :D async pipe

  // 👇 You can make telemetry public. but I prefer doing this so I can keep things easy for testing
  readonly position$ = this.telemetry.position$;
  readonly speed$ = this.telemetry.speed$.pipe(map((val) => val * 2.23694));
  readonly timestamp$ = this.telemetry.timestamp$;

  constructor(
    public telemetry: TelemetryService,
    private modalCtrl: ModalController
  ) {}

  async setAltitude() {
    const modal = await this.modalCtrl.create({
      component: UpdateAltitudeComponent,
    });
    await modal.present();
    const data = await modal.onDidDismiss();
    if (data && data.data) {
      this.telemetry.updateAltitudeRange(data.data);
    }
  }

  async resetOverlay() {
    const modal = await this.modalCtrl.create({
      component: ResetOverlayComponent,
    });
    await modal.present();
    const data = await modal.onDidDismiss();
    if (data && data.data) {
      this.telemetry.resetOverlay();
    }
  }
}
