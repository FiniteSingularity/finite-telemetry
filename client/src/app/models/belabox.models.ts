export interface BelaMessage {
  connected?: boolean;
  config?: Config;
  pipelines?: Pipelines;
  status?: Status;
  netif?: Netif;
  sensors?: Sensors;
  revisions?: Revisions;
  notifications?: Notification;
  notification?: Notification;
}

export interface Config {
  password_hash: string;
  max_br: number;
  delay: number;
  pipeline: string;
  srt_latency: number;
  srt_streamid: string;
  srtla_addr: string;
  srtla_port: string;
  bitrate_overlay: boolean;
  ssh_pass: string;
  remote_key: string;
}

export interface Netif {
  [key: string]: NetworkInterface;
}

export interface NetworkInterface {
  ip: string;
  txb: number;
  tp: number;
  enabled: boolean;
}

export interface NotificationMessage {
  name: string;
  type: string;
  msg: string;
  is_dismissable: boolean;
  is_persistent: boolean;
  duration: number;
}

export interface Notification {
  show: NotificationMessage[];
}

export interface Pipelines {
  [key: string]: string;
}

export interface Revisions {
  belaUI: string;
  belacoder: string;
  srtla: string;
  'BELABOX image': string;
}

export interface Sensors {
  'SoC temperature': string;
}

export interface Status {
  is_streaming: boolean;
}
