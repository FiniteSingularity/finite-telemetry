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
  tauUrl$ = this.auth.tauUrl$;
  tauUser$ = this.auth.tauUser$;
  tauToken$ = this.auth.tauToken$;
  tauConnected$ = this.auth.tauConnected$;
  telemetryUrl$ = this.auth.telemetryUrl$;
  telemetryUser$ = this.auth.telemetryUser$;
  telemetryToken$ = this.auth.telemetryToken$;
  telemetryConnected$ = this.auth.telemetryConnected$;

  constructor(
    private storage: StorageService,
    private auth: AuthService,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {}

  async setupTau() {
    const modal = await this.modalCtrl.create({
      component: SetupTauComponent,
    });
    await modal.present();
    const data = await modal.onDidDismiss();

    if (data && data.data) {
      this.auth.setupTau(data.data);
    }
  }

  async setupTelemetry() {
    const modal = await this.modalCtrl.create({
      component: SetupTelemetryComponent,
    });
    await modal.present();
    const data = await modal.onDidDismiss();

    if (data && data.data) {
      this.auth.setupTelemetry(data.data);
    }
  }
}
