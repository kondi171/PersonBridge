export enum ActiveState {
  PANEL = '/access',
  CHATS = '/access/chat',
  FRIENDS = '/access/friends',
  EXPLORE = '/access/explore',
  SETTINGS = '/access/settings'
}

export enum CardType {
  ONLINE,
  OFFLINE,
  BLOCKED,
  REQUEST
}

export enum Device {
  MOBILE,
  DESKTOP,
}

export enum Position {
  STICKY,
  FIXED
}