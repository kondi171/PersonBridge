import { Document } from "mongoose";
import { Biometrics, FriendAccessibility, FriendRequests, FriendSettings, MessageReaction } from "./types";
import { MessageSender, UserStatus } from "./enums";

export interface UserDocument extends Document {
    name: string;
    lastname: string;
    mail: string;
    password: string;
    avatar: string;
    status: UserStatus;
    biometrics: Biometrics;
    friends: Friend[];
    requests: FriendRequests;
    blocked: string[];
    chatbots: any[];
}

export interface Friend {
    id: string;
    settings: FriendSettings,
    accessibility: FriendAccessibility,
    messages: Message[];
}

export interface Message {
    id: string,
    content: string;
    date: Date;
    sender: MessageSender;
    read: boolean;
    reactions: MessageReaction[];
}