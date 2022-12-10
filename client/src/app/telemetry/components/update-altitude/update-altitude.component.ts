import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-update-altitude',
  templateUrl: './update-altitude.component.html',
  styleUrls: ['./update-altitude.component.scss'],
})
export class UpdateAltitudeComponent implements OnInit {
  baseAltitude = 0;
  summitAltitude = 1000;

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {}

  save() {
    this.modalCtrl.dismiss({
      minAlt: this.baseAltitude,
      maxAlt: this.summitAltitude,
    });
  }

  cancel() {
    this.modalCtrl.dismiss();
  }

  valid() {
    return this.summitAltitude > this.baseAltitude;
  }
}
