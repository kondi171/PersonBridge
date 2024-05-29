import { Document } from "mongoose";
import { Biometrics, FriendAccessibility, FriendRequests, FriendSettings, MessageReaction } from "./types";
import { UserStatus } from "./enums";

export interface UserDocument extends Document {
    name: string,
    lastname: string,
    mail: string,
    password: string,
    avatar: string,
    status: UserStatus,
    biometrics: Biometrics,
    friends: Friend[],
    requests: FriendRequests,
    groups: Group[],
    blocked: string[],
    chatbots: any[]
}

export interface Friend {
    id: string,
    settings: FriendSettings,
    accessibility: FriendAccessibility,
    messages: Message[]
}

export interface Message {
    id: string,
    content: string,
    date: Date,
    sender: string,
    read: boolean,
    reactions: MessageReaction[]
}

export interface Group {
    id: string,
    name: string,
    avatar: string,
    status: UserStatus,
    administrator: string,
    participants: string[],
    messages: Message[],
    accessibility: {
        mute: boolean,
        ignore: boolean
    }
}
