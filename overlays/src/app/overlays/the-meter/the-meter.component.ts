import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { TelemetryNormalizerService } from 'src/app/services/telemetry-normalizer.service';
import { TelemetryService } from 'src/app/services/telemetry.service';

export interface InfoText {
  speedLabel: string;
  distanceLabel: string;
  altitudeLabel: string;
  maxSpeed: number;
  distance: number;
  runs: number;
  alt: number;
  maxAlt: number;
  totalVert: number;
}

export interface SpeedText {
  speedLabel: string;
  speed: number;
}

export interface AltitudeText {
  altitude: number;
  altMeterLabel: string;
  minAltitude: number;
  maxAltitude: number;
}

@Component({
  selector: 'app-the-meter',
  templateUrl: './the-meter.component.html',
  styleUrls: ['./the-meter.component.scss'],
})
export class TheMeterComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('themeter', { static: false })
  theMeter?: ElementRef<HTMLCanvasElement>;
  @ViewChild('meterbg',  { static: false })
  meterBg?: ElementRef<HTMLCanvasElement>;

  minAlt = 690;
  maxAlt = 1024;

  backgroundColor = '#000000';
  imperialMeterContext: CanvasRenderingContext2D | null = null;
  metricMeterContext: CanvasRenderingContext2D | null = null;
  meterBgContext: CanvasRenderingContext2D | null = null;

  speedGradient: CanvasGradient | undefined;
  altitudeGradient: CanvasGradient | undefined;
  dialGradientOutside: CanvasGradient | undefined;
  dialGradientMiddle: CanvasGradient | undefined;
  dialGradientInside: CanvasGradient | undefined;
  tickGradient: CanvasGradient | undefined;
  messageLineGradient: CanvasGradient | undefined;

  imperialInfo: InfoText = {
    speedLabel: 'MPH',
    distanceLabel: 'MI',
    altitudeLabel: 'FT',
    maxAlt: 12854,
    maxSpeed: 45.2,
    distance: 15.83,
    runs: 10,
    alt: 11362,
    totalVert: 42326,
  };

  imperialSpeed: SpeedText = {
    speedLabel: 'MPH',
    speed: 32,
  };

  imperialAltitude: AltitudeText = {
    minAltitude: 9000,
    maxAltitude: 13000,
    altitude: 1250,
    altMeterLabel: "'",
  };

  subs = new Subscription();

  constructor(
    private telemetryNorm: TelemetryNormalizerService,
    private telemetryRaw: TelemetryService
  ) {}

  ngOnInit(): void {
    this.subs.add(
      this.telemetryRaw.allData$.subscribe((data) => {
        this.imperialAltitude = {
          ...this.imperialAltitude,
          minAltitude: Math.floor(data.minAltitude * 3.28084),
          maxAltitude: Math.floor(data.maxAltitude * 3.28084),
        };
        this.imperialInfo = {
          ...this.imperialInfo,
          maxSpeed: data.maxSpeed * 2.23694,
          runs: data.runs,
          alt: Math.floor(data.telemetry?.altitude! * 3.28084),
          maxAlt: Math.floor(data.maxSessionAltitude! * 3.28084),
        };
        // this.drawCluster(
        //   this.imperialMeterContext!,
        //   this.imperialInfo,
        //   this.imperialSpeed,
        //   this.imperialAltitude
        // );
      })
    );
    this.subs.add(
      this.telemetryRaw.distance$.subscribe((dist) => {
        this.imperialInfo = {
          ...this.imperialInfo,
          distance: dist * 0.000621371
        };
      })
    );
    this.subs.add(
      this.telemetryRaw.vert$.subscribe((vert) => {
        this.imperialInfo = {
          ...this.imperialInfo,
          totalVert: vert * 3.28084
        }
      })
    );
    this.subs.add(
      this.telemetryNorm.telemetry$.subscribe((data) => {
        this.imperialAltitude = {
          ...this.imperialAltitude,
          altitude: data?.altitude! * 3.2084,
        };

        this.imperialSpeed = {
          ...this.imperialSpeed,
          speed: Math.floor(data?.speed! * 2.23694),
        };

        this.drawCluster(
          this.imperialMeterContext!,
          this.imperialInfo,
          this.imperialSpeed,
          this.imperialAltitude
        );
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.setupCanvas();
    this.loadFont(this.meterBgContext!);
    this.loadFont(this.imperialMeterContext!);
    setTimeout(() => {
      this.drawBaseCluster(this.meterBgContext!);
      this.drawCluster(
        this.imperialMeterContext!,
        this.imperialInfo,
        this.imperialSpeed,
        this.imperialAltitude
      );
    }, 1000);
  }

  setupCanvas() {
    const ele = this.theMeter!.nativeElement;
    const bgEle = this.meterBg!.nativeElement;

    const size = Math.min(window.innerHeight, window.innerWidth);

    this.theMeter!.nativeElement.width = window.innerWidth;
    this.theMeter!.nativeElement.height = window.innerHeight;
    bgEle.width = window.innerWidth;
    bgEle.height = window.innerHeight;

    this.imperialMeterContext = ele.getContext('2d');
    this.imperialMeterContext?.scale(window.innerWidth/970, window.innerWidth/970);

    this.meterBgContext = bgEle.getContext('2d');
    this.meterBgContext?.scale(window.innerWidth/970, window.innerWidth/970);

    this.dialGradientOutside = this.meterBgContext?.createRadialGradient(
      485,
      175,
      152,
      485,
      175,
      170
    );
    this.dialGradientOutside?.addColorStop(0, 'rgba(0, 0, 0, 0)');
    this.dialGradientOutside?.addColorStop(1, 'rgba(255, 255, 255, 1.0)');

    this.dialGradientMiddle = this.meterBgContext?.createRadialGradient(
      485,
      175,
      135,
      485,
      175,
      160
    );
    this.dialGradientMiddle?.addColorStop(0, 'rgba(0, 0, 0, 0)');
    this.dialGradientMiddle?.addColorStop(1, 'rgba(128, 128, 128, 1.0)');

    this.dialGradientInside = this.meterBgContext?.createRadialGradient(
      485,
      175,
      100,
      485,
      175,
      140
    );
    this.dialGradientInside?.addColorStop(0, 'rgba(0, 0, 0, 0)');
    this.dialGradientInside?.addColorStop(1, 'rgba(128, 128, 128, 0.5)');

    this.tickGradient = this.meterBgContext?.createLinearGradient(
      65,
      0,
      90,
      0
    );

    this.tickGradient?.addColorStop(0, 'rgba(0, 0, 0, 0)');
    this.tickGradient?.addColorStop(1, 'rgba(128, 128, 128, 0.5)');

    this.messageLineGradient = this.meterBgContext?.createLinearGradient(
      58,
      0,
      916,
      0
    );

    this.messageLineGradient?.addColorStop(0, 'rgba(255, 4, 0, 0)');
    this.messageLineGradient?.addColorStop(0.105, 'rgba(252, 122, 0, 1.0)');
    this.messageLineGradient?.addColorStop(0.255, 'rgba(252, 122, 0, 1.0)');
    this.messageLineGradient?.addColorStop(0.31, 'rgba(255, 4, 0, 0.0)');
    this.messageLineGradient?.addColorStop(0.69, 'rgba(255, 4, 0, 0.0)');
    this.messageLineGradient?.addColorStop(0.745, 'rgba(252, 122, 0, 1.0)');
    this.messageLineGradient?.addColorStop(0.895, 'rgba(252, 122, 0, 1.0)');
    this.messageLineGradient?.addColorStop(1.0, 'rgba(255, 4, 0, 0)');
  }

  loadFont(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, 970, 350);
    ctx!.font = 'normal 500 5px Orbitron';
    ctx!.textAlign = 'center';
    ctx!.fillStyle = '#FFFFFF';
    ctx?.fillText('30', 485, 170);
    ctx!.font = 'normal 500 5px Saira';
    ctx!.textAlign = 'center';
    ctx!.fillStyle = '#FFFFFF';
    ctx?.fillText('30', 485, 170);
  }

  drawBaseCluster(ctx: CanvasRenderingContext2D) {
    this.drawClusterBg(ctx);
    this.drawClusterDial(ctx);
    this.drawMsgContainers(ctx);
    this.drawStaticText(ctx);
  }

  drawCluster(
    ctx: CanvasRenderingContext2D,
    info: InfoText,
    speed: SpeedText,
    altitude: AltitudeText
  ) {
    if(ctx) {
      ctx.clearRect(0, 0, 970, 350);
      this.drawAltTicks(ctx, altitude);
      this.drawSpeed(ctx, speed);
      this.drawText(ctx, info);
    }
  }

  drawMsgContainers(ctx: CanvasRenderingContext2D) {
    ctx.lineWidth = 3;
    ctx.strokeStyle = this.messageLineGradient!;

    ctx.beginPath();
    ctx.moveTo(58, 86);
    ctx.lineTo(283, 86);
    ctx.bezierCurveTo(300, 86, 327, 110, 327, 110);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(58, 292);
    ctx.lineTo(283, 292);
    ctx.bezierCurveTo(300, 292, 327, 268, 327, 268);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(912, 86);
    ctx.lineTo(687, 86);
    ctx.bezierCurveTo(670, 86, 643, 110, 643, 110);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(912, 292);
    ctx.lineTo(687, 292);
    ctx.bezierCurveTo(670, 292, 643, 268, 643, 268);
    ctx.stroke();
  }

  drawSpeed(ctx: CanvasRenderingContext2D, speed: SpeedText) {
    ctx.font = 'normal 500 75px Saira';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`${speed.speed.toFixed(0)}`, 485, 195);
    ctx.font = 'normal 500 20px Saira';
    ctx.fillText(`${speed.speedLabel}`, 485, 218);
  }

  drawTickmark(ctx: CanvasRenderingContext2D, angle: number) {
    ctx.lineWidth = 2;
    ctx.strokeStyle = this.tickGradient!;
    ctx.save();
    ctx.translate(485, 175);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(65, 0);
    ctx.lineTo(90, 0);
    ctx.stroke();
    ctx.restore();
  }

  drawStaticText(ctx: CanvasRenderingContext2D) {
    ctx.font = 'normal 500 25px Saira';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('Speed/Dist', 170, 130);
    ctx.fillText('Altitude', 800, 130);

    ctx.font = 'normal 500 20px Saira';
    ctx.textAlign = 'start';
    ctx.fillText('Max Speed:', 30, 180);
    ctx.fillText('Distance Skied:', 40, 220);
    ctx.fillText('Runs:', 50, 260);
    ctx.fillText('Altitude:', 690, 180);
    ctx.fillText('Max Alt:', 690, 220);
    ctx.fillText('Total Vert:', 690, 260);
  }

  drawText(ctx: CanvasRenderingContext2D, info: InfoText) {
    ctx.font = 'normal 500 20px Saira';
    ctx.textAlign = 'end';
    ctx.fillText(
      `${info.maxSpeed.toLocaleString(undefined, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      })} ${info.speedLabel}`,
      280,
      180
    );
    ctx.fillText(
      `${info.distance.toLocaleString(undefined, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      })} ${info.distanceLabel}`,
      280,
      220
    );
    ctx.fillText(`${info.runs}`, 280, 260);

    ctx.font = 'normal 500 20px Saira';
    ctx.textAlign = 'end';
    ctx.fillText(
      `${info.alt.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })} ${info.altitudeLabel}`,
      940,
      180
    );
    ctx.fillText(
      `${info.maxAlt.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })} ${info.altitudeLabel}`,
      930,
      220
    );
    ctx.fillText(
      `${info.totalVert.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })} ${info.altitudeLabel}`,
      930,
      260
    );
  }

  drawAltTicks(ctx: CanvasRenderingContext2D, altitude: AltitudeText) {
    let minAltTick = 0;
    let maxAltTick = 0;
    let key = altitude.altMeterLabel;
    let scale = 'x1000';
    if (altitude.maxAltitude - altitude.minAltitude < 1000) {
      minAltTick = Math.floor(altitude.minAltitude / 100.0);
      maxAltTick = Math.ceil(altitude.maxAltitude / 100.0);
      scale = 'x100';
    } else {
      minAltTick = Math.floor(altitude.minAltitude / 1000.0);
      maxAltTick = Math.ceil(altitude.maxAltitude / 1000.0);
      scale = 'x1000';
    }

    const numTicks = maxAltTick - minAltTick;
    const tickSize = (1.375 * Math.PI) / numTicks;

    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(252, 122, 0, 1.0)';
    ctx.shadowColor = 'rgba(255, 4, 0, 1.0)';
    ctx.shadowBlur = 6;
    const angle =
      Math.PI *
      (0.625 +
        (1.375 * (altitude.altitude - altitude.minAltitude)) /
          (altitude.maxAltitude - altitude.minAltitude));
    ctx.arc(485, 175, 159, 0.5 * Math.PI, angle);
    ctx.stroke();

    let j = 0;

    for (let i = minAltTick; i <= maxAltTick; i++) {
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.fillStyle = this.backgroundColor;
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 5;
      ctx.save();
      ctx.translate(485, 175);
      const rotation = 0.625 * Math.PI + j * tickSize;
      ctx.rotate(rotation);
      ctx.beginPath();
      ctx.moveTo(140, -1);
      ctx.lineTo(140, 1);
      ctx.lineTo(170, 3);
      ctx.lineTo(170, -3);
      ctx.closePath();
      ctx.stroke();
      ctx.fill();
      ctx.restore();

      let x = 485 + 115 * Math.cos(rotation);
      let y = 185 + 115 * Math.sin(rotation);

      ctx.font = 'normal 500 25px Saira';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.fillText(`${i}`, x, y);
      j++;
    }
    ctx.shadowBlur = 2;
    j = 0;
    for (let i = minAltTick; i < maxAltTick; i++) {
      ctx.lineWidth = 6;
      ctx.strokeStyle = this.backgroundColor;
      ctx.fillStyle = this.backgroundColor;
      ctx.save();
      ctx.translate(485, 175);
      const rotation = 0.625 * Math.PI + (j + 0.5) * tickSize;
      ctx.rotate(rotation);
      ctx.beginPath();
      ctx.moveTo(143, 0);
      ctx.lineTo(153, 0);
      ctx.stroke();
      ctx.restore();
      j++;
    }
    ctx.shadowBlur = 0;

    ctx.font = 'normal 500 20px Orbitron';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`ALT`, 640, 210);
    ctx.font = 'normal 500 15px Saira';
    ctx.fillText(`${scale}${key}`, 640, 225);
  }

  drawClusterDial(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 1.0)';
    ctx.lineWidth = 2;
    ctx.fillStyle = this.dialGradientOutside!;
    ctx.arc(485, 175, 165, 0.5 * Math.PI, 2.0 * Math.PI);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = 'rgba(128, 128, 128, 1.0)';
    ctx.lineWidth = 2;
    ctx.fillStyle = this.dialGradientMiddle!;
    ctx.arc(485, 175, 155, 0.5 * Math.PI, 2.0 * Math.PI);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = 'rgba(128, 128, 128, 0.5)';
    ctx.lineWidth = 4;
    ctx.fillStyle = this.dialGradientInside!;
    ctx.arc(485, 175, 140, 0.5 * Math.PI, 2.0 * Math.PI);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = this.backgroundColor;
    ctx.fillRect(485, 175, 170, 170);

    for (
      let angle = 0.5 * Math.PI;
      angle <= 2.0 * Math.PI + 0.02;
      angle += Math.PI / 32.0
    ) {
      this.drawTickmark(ctx, angle);
    }

    ctx?.save();
  }

  drawClusterBg(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.moveTo(36, 350);
    ctx.lineTo(0, 160);
    const p11 = { x: 0, y: 88 };
    const mBp1 = -0.4;
    const bBp1a = 12;
    const bBp1b = 18;
    const p12 = { x: 36 - bBp1a, y: 88 - mBp1 * (36 - bBp1a) };
    ctx.bezierCurveTo(p11.x, p11.y, p12.x, p12.y, 36, 88);

    const mBp2 = -0.2;
    const bBp2a = 100;
    const bBp2b = 40;
    ctx.bezierCurveTo(
      36 + bBp1b,
      88 + mBp1 * bBp1b,
      246 - bBp2a,
      14 - mBp2 * (226 - bBp2a),
      246,
      14
    );

    const bBp3a = 100;

    ctx.bezierCurveTo(246 + bBp2b, 14 + mBp2 * bBp2b, 485 - bBp3a, 0, 485, 0);
    ctx.bezierCurveTo(485 + bBp3a, 0, 724 - bBp2b, 14 + mBp2 * bBp2b, 724, 14);

    ctx.bezierCurveTo(
      724 + bBp2a,
      14 - mBp2 * (226 - bBp2a),
      934 - bBp1b,
      88 + mBp1 * bBp1b,
      934,
      88
    );

    ctx.bezierCurveTo(934 + bBp1a, 88 - mBp1 * (36 - bBp1a), 970, 88, 970, 160);

    ctx.lineTo(934, 350);
    ctx.closePath();
    ctx.fillStyle = '#000';
    ctx.fill();
  }
}
