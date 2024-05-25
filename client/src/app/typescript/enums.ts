export enum ActiveState {
  PANEL = '/access',
  CHATS = '/access/chat',
  FRIENDS = '/access/friends',
  EXPLORE = '/access/explore',
  SETTINGS = '/access/settings'
}

export enum ChatType {
  USER_CHAT,
  GROUP_CHAT
}

export enum CardType {
  ONLINE,
  OFFLINE,
  GROUPS,
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

export enum UserStatus {
  ONLINE = 'Online',
  OFFLINE = 'Offline'
}

export enum Modal {
  CHANGE_AVATAR,
  EDIT_NAME,
  EDIT_LASTNAME,
  EDIT_MAIL,
  EDIT_PASSWORD,
  SET_FINGERPRINT,
  SET_FACE,
  SET_VOICE,
  DELETE_MESSAGES,
  DELETE_ACCOUNT,
  REMOVE_FRIEND,
  CREATE_GROUP,
}