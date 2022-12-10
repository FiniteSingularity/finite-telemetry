import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-reset-overlay',
  templateUrl: './reset-overlay.component.html',
  styleUrls: ['./reset-overlay.component.scss'],
})
export class ResetOverlayComponent implements OnInit {
  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {}

  reset() {
    this.modalCtrl.dismiss({ reset: true });
  }

  cancel() {
    this.modalCtrl.dismiss();
  }
}
