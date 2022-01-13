import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { StorageService } from '../services/storage.service';
import { SetupTauComponent } from './components/setup-tau/setup-tau.component';
import { SetupTelemetryComponent } from './components/setup-telemetry/setup-telemetry.component';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  tauSettings$ = this.auth.tauSettings$;
  telemetrySettings$ = this.auth.telemetrySettings$;

  constructor(
    private storage: StorageService,
    private auth: AuthService,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {}

  async setup(type: 'tau' | 'telemetry') {
    const component = type === 'tau' ? SetupTauComponent : SetupTelemetryComponent;
    const modal = await this.modalCtrl.create({ component });
    await modal.present();
    const data = await modal.onDidDismiss();

    if (data && data.data) {
      this.auth.setup(data.data);
    }
  }
}
