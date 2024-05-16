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
        PIN: string,
    },
    messages: Message[]
}

export interface MessageRow {
    id: string,
    name: string,
    lastname: string,
    avatar: string,
    status: UserStatus,
    lastMessage: Message
}