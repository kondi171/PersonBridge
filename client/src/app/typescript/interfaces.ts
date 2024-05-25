import { ChatType, UserStatus } from "./enums"
import { FriendAccessibility, FriendSettings, MessageReaction, Participant } from "./types"

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
export interface GroupChatData {
    id: string,
    name: string,
    avatar: string,
    administrator: string,
    status: UserStatus,
    PIN: number,
    participants: Participant[],
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
    accessibility: FriendAccessibility
}

export interface MessageRow {
    id: string;
    name: string;
    lastname?: string;  // Pole lastname będzie opcjonalne, ponieważ grupy nie mają nazwisk
    avatar: string;
    status: UserStatus;
    lastMessage: Message;
    settings?: FriendSettings; // Pole settings będzie opcjonalne, ponieważ grupy mogą nie mieć tych ustawień
    accessibility?: FriendAccessibility; // Pole accessibility będzie opcjonalne, ponieważ grupy mogą nie mieć tych ustawień
    type: ChatType
}

export type Message = {
    id: string,
    content: string,
    date: Date,
    sender: string,
    read: boolean,
    reactions: MessageReaction[]
}

