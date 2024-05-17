import { UserStatus } from "./enums"
import { FriendSettings, Message } from "./types"

export interface User {
    _id: string,
    name: string,
    lastname: string,
    mail: string,
    password: string,
    avatar: string,
    status: string,
    biometrics: {
        fingerprint: string,
        voice: string,
        face: string,
    },
    friends: Friend[],
    requests: {
        received: [],
        sent: []
    },
    blocked: [],
    chatbots: []
}

export interface Friend {
    id: string,
    settings: FriendSettings,
    messages: Message[]
}
export interface FriendChatData {
    id: string,
    name: string,
    lastname: string,
    avatar: string,
    status: string,
    accessibility: {
        mute: false,
        ignore: false,
        block: false
    },
    settings: FriendSettings,
    blocked: string[]
}
export interface FriendSettingsData {
    id: string,
    name: string,
    lastname: string,
    mail: string,
    avatar: string,
    messagesCounter: number,
    settings: FriendSettings,
    accessibility: {
        mute: boolean,
        ignore: boolean,
        block: boolean
    },
}


