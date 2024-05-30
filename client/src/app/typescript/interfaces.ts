import { ChatType, UserStatus } from "./enums"
import { Accessibility, FriendSettings, MessageReaction, Participant } from "./types"

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
        received: string[],
        sent: string[]
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
    accessibility: Accessibility,
    settings: FriendSettings,
    blocked: string[]
}

export interface GroupChatData {
    id: string,
    name: string,
    avatar: string,
    administrator: string,
    status: UserStatus,
    PIN: number,
    participants: {
        id: string,
        avatar: string,
        status: string,
        nickname: string
    }[],
    accessibility: {
        mute: boolean,
        ignore: boolean
    },
    messages: Message[]
}

export interface FriendSettingsData {
    id: string,
    name: string,
    lastname: string,
    mail: string,
    avatar: string,
    messagesCounter: number,
    settings: FriendSettings,
    accessibility: Accessibility
}

export interface GroupSettingsData {
    id: string,
    name: string,
    avatar: string,
    administrator: Participant,
    participants: Participant[],
    accessibility: Accessibility,
    messages: Message[]
}

export interface MessageRow {
    id: string,
    name: string,
    lastname?: string,
    avatar: string,
    status?: UserStatus,
    lastMessage: Message,
    settings?: FriendSettings,
    accessibility?: Accessibility,
    type: ChatType,
    administrator?: string,
    participants?: {
        id: string,
        status: UserStatus,
        name: string
    }[]
}

export interface Message {
    id: string,
    content: string,
    date: Date,
    sender: string,
    read: boolean,
    reactions: MessageReaction[]
}

