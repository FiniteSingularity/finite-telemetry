import { Component, OnInit } from '@angular/core';
import { TelemetryService } from './services/telemetry.service';
import { TwitchChatService } from './services/twitch-chat.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(
    private telemetry: TelemetryService,
    private twitchChat: TwitchChatService,
  ) {}

  ngOnInit(): void {
    //this.telemetry.watchPosition();
  }
}
