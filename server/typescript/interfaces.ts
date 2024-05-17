import { Document } from "mongoose";
import { Biometrics } from "./types";

export interface UserDocument extends Document {
    name: string;
    lastname: string;
    mail: string;
    password: string;
    avatar: string;
    status: UserStatus;
    biometrics: Biometrics;
    friends: Friend[];
    requests: {
        received: string[];
        sent: string[];
    };
    blocked: string[];
    chatbots: any[];
}

export interface Friend {
    id: string;
    settings: {
        nickname: string;
        PIN: number;
    };
    accessibility: {
        mute: boolean;
        ignore: boolean;
        block: boolean;
    };
    messages: Message[];
}

export interface Message {
    content: string;
    date: Date;
    sender: MessageSender;
    read: boolean;
}

export enum UserStatus {
    ONLINE,
    OFFLINE,
    AWAY
}

export enum MessageSender {
    YOU,
    FRIEND,
    SYSTEM
}