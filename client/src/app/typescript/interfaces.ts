import { UserStatus } from "./enums"
import { FriendAccessibility, FriendSettings, Message } from "./types"

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
    accessibility: FriendAccessibility,
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
    accessibility: FriendAccessibility
}

export interface MessageRow {
    id: string,
    name: string,
    lastname: string,
    avatar: string,
    status: UserStatus,
    lastMessage: {
        you: Message,
        friend: Message
    }
    friendLastMessage: Message,
    settings: FriendSettings,
    accessibility: FriendAccessibility
}
