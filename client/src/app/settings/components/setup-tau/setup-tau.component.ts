import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { catchError, concatMap, switchMap, throwError } from 'rxjs';

@Component({
  selector: 'app-setup-tau',
  templateUrl: './setup-tau.component.html',
  styleUrls: ['./setup-tau.component.scss'],
})
export class SetupTauComponent extends ComponentStore<{}> {
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
                  tauUser: this.user,
                  tauUrl: this.address,
                  tauToken: resp.token,
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
