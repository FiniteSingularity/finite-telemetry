import { Component, OnInit } from '@angular/core';
import { TelemetryService } from 'src/app/services/telemetry.service';

@Component({
  selector: 'app-max-speed',
  templateUrl: './max-speed.component.html',
  styleUrls: ['./max-speed.component.scss'],
})
export class MaxSpeedComponent implements OnInit {
  maxSpeed$ = this.telemetry.maxSpeed$;
  speedScaling = 2.23694;
  speedScaleStr = 'MPH';
  constructor(private telemetry: TelemetryService) {}

  ngOnInit(): void {}
}
