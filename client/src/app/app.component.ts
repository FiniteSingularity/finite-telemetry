import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
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
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.auth.load();
    this.telemetry.watchPosition();
  }
}
