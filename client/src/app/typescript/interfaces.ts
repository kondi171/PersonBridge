import { UserStatus } from "./enums"
import { Message } from "./types"

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
    settings: {
        nickname: string,
        PIN: number,
    },
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
    settings: {
        nickname: '',
        PIN: 0,
    },
    blocked: string[]
}
export interface FriendSettingsData {
    id: string,
    name: string,
    lastname: string,
    mail: string,
    avatar: string,
    messagesCounter: number,
    settings: {
        nickname: string,
        PIN: number,
    },
    accessibility: {
        mute: boolean,
        ignore: boolean,
        block: boolean
    },
}