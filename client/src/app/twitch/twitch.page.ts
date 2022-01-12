import { Component, OnInit } from '@angular/core';
import { TwitchChatService } from '../services/twitch-chat.service';

@Component({
  selector: 'app-twitch',
  templateUrl: './twitch.page.html',
  styleUrls: ['./twitch.page.scss'],
})
export class TwitchPage implements OnInit {

  constructor(
    public twitchChat: TwitchChatService
  ) { }

  ngOnInit() {
  }

}
