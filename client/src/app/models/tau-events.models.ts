export interface TAUEvent {
  eventType:
    | 'TwitchChatMessage'
    | 'ChannelPointRedemption'
    | 'Cheer'
    | 'Raid'
    | 'Follow'
    | 'Sub'
    | 'GiftSub';
  event:
    | TwitchChatMessage
    | ChannelPointRedemption
    | Cheer
    | Raid
    | Follow
    | Sub
    | GiftSub;
  timestamp: Date;
}

export interface TwitchChatMessage {
  raw: string;
  tags: TwitchChatTags;
  prefix: string;
  command: string;
  params: string[];
  'message-text': string;
}

export interface TwitchChatTags {
  'badge-info': string;
  badges: string;
  'client-nonce': string;
  color: string;
  'display-name': string;
  emotes: TwitchChatEmote[];
  'first-msg': string;
  flags: string;
  id: string;
  mod: string;
  'room-id': string;
  subscriber: string;
  'tmi-sent-ts': string;
  turbo: string;
  'user-id': string;
  'user-type': string;
}

export interface TwitchChatEmote {
  id: string;
  positions: Array<number[]>;
}

export interface TAUTwitchEvent {
  id: string;
  event_id: string;
  event_type:
    | 'channel-channel_points_custom_reward_redemption-add'
    | 'channel-cheer'
    | 'channel-follow'
    | 'channel-raid'
    | 'channel-subscription-message'
    | 'channel-subscription-gift';
  event_data:
    | ChannelPointRedemption
    | Cheer
    | Follow
    | Raid
    | SubMessage
    | GiftSub;
  created: string;
  origin: string;
}

export interface ChannelPointRedemption {
  broadcaster_user_id: string;
  broadcaster_user_login: string;
  broadcaster_user_name: string;
  id: string;
  user_id: string;
  user_login: string;
  user_name: string;
  user_input: string;
  user_input_emotes?: ChannelPointEmote[];
  status: string;
  redeemed_at: string;
  reward: ChannelPointReward;
}

export interface ChannelPointReward {
  id: string;
  title: string;
  prompt: string;
  cost: number;
}

export interface ChannelPointEmote {
  id: string;
  positions: Array<number[]>;
}

export interface Cheer {
  is_anonymous: boolean;
  user_id: string;
  user_name: string;
  user_login: string;
  broadcaster_user_id: string;
  broadcaster_user_name: string;
  broadcaster_user_login: string;
  bits: string;
  message: string;
}

export interface Follow {
  user_id: string;
  user_name: string;
  user_login: string;
  followed_at: string;
  broadcaster_user_id: string;
  broadcaster_user_name: string;
  broadcaster_user_login: string;
}

export interface Raid {
  from_broadcaster_user_id: string;
  from_broadcaster_user_name: string;
  from_broadcaster_user_login: string;
  to_broadcaster_user_id: string;
  to_broadcaster_user_name: string;
  to_broadcaster_user_login: string;
  viewers: number;
}

export interface SubMessage {
  user_id: string;
  user_login: string;
  user_name: string;
  broadcaster_user_id: string;
  broadcaster_user_login: string;
  broadcaster_user_name: string;
  followed_at: string;
}

export interface Sub {
  user_id: string;
  user_login: string;
  user_name: string;
  broadcaster_user_id: string;
  broadcaster_user_login: string;
  broadcaster_user_name: string;
  message: SubMessage;
  tier: string;
  cumulative_months: number;
  streak_months: number;
  duration_months: number;
}

export interface SubMessage {
  text: string;
  emotes: null;
}

export interface GiftSub {
  user_id: string;
  user_login: string;
  user_name: string;
  broadcaster_user_id: string;
  broadcaster_user_login: string;
  broadcaster_user_name: string;
  total: number;
  tier: string;
  cumulative_total: number;
  is_anonymous: boolean;
}
