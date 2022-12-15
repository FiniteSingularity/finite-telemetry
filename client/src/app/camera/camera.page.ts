import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { pipe, Subscription } from 'rxjs';
import { Config, NetworkInterface } from '../models/belabox.models';
import { BelaboxRemoteService } from '../services/belabox-remote.service';

@Component({
  selector: 'app-camera',
  templateUrl: './camera.page.html',
  styleUrls: ['./camera.page.scss'],
})
export class CameraPage implements OnInit, OnDestroy {
  view = 'streaming';
  config: Config;
  pipelines: { id: string; name: string }[] = [];
  netif: { id: string; iface: NetworkInterface }[] = [];
  subs = new Subscription();
  constructor(
    public belaBox: BelaboxRemoteService,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.subs.add(
      this.belaBox.config$.subscribe((config) => (this.config = config))
    );
    this.subs.add(
      this.belaBox.pipelines$.subscribe((pipelines) => {
        this.pipelines = Object.keys(pipelines).map((key) => ({
          id: key,
          name: pipelines[key],
        }));
      })
    );
    this.subs.add(
      this.belaBox.netif$.subscribe((netif) => {
        this.netif = Object.keys(netif).map((key) => ({
          id: key,
          iface: netif[key],
        }));
      })
    );
    this.subs.add(
      this.belaBox.notification$.subscribe((notifications) => {
        notifications.show.forEach(async (notification) => {
          const toast = await this.toastCtrl.create({
            message: notification.msg,
            duration: notification.duration * 1000,
            position: 'top',
            color: notification.type === 'error' ? 'danger' : 'warning',
          });
          await toast.present();
        });
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  pipelineName(name: string) {
    return name.split('/')[1].split('_').join(' ');
  }

  stream(command: 'start' | 'stop') {
    if (command === 'start') {
      this.belaBox.send({ start: this.config });
    } else if (command === 'stop') {
      this.belaBox.send({ stop: 0 });
    }
  }

  mbrChange(ev: any, streaming = false) {
    if (streaming) {
      this.belaBox.send({ bitrate: { max_br: this.config.max_br } });
    }
  }

  netifChange(ev: any, netif: { id: string; iface: NetworkInterface }) {
    const newValue = ev.detail.value === 'on';
    if (netif.iface.enabled === newValue) {
      return;
    }
    this.belaBox.send({
      netif: {
        name: netif.id,
        ip: netif.iface.ip,
        enabled: netif.iface.enabled,
      },
    });
  }

  sendCommand(command) {
    this.belaBox.send({ command });
  }
}
