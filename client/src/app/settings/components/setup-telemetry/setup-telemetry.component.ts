import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { concatMap } from 'rxjs';

@Component({
  selector: 'app-setup-telemetry',
  templateUrl: './setup-telemetry.component.html',
  styleUrls: ['./setup-telemetry.component.scss'],
})
export class SetupTelemetryComponent extends ComponentStore<{}> {
  address: string = null;
  user: string = null;
  password: string = null;

  constructor(private modalCtrl: ModalController, private http: HttpClient) {
    super({});
  }

  readonly login = this.effect((trigger$) =>
    trigger$.pipe(
      concatMap(() => {
        const url = `${this.address}/api-token-auth/`;
        return this.http
          .post<{ token: string }>(url, {
            username: this.user,
            password: this.password,
          })
          .pipe(
            tapResponse(
              (resp) => {
                this.modalCtrl.dismiss({
                  telemetryUser: this.user,
                  telemetryUrl: this.address,
                  telemetryToken: resp.token,
                });
              },
              (err) => {
                console.log(err);
              }
            )
          );
      })
    )
  );

  cancel() {
    this.modalCtrl.dismiss();
  }
}
