import { Document } from "mongoose";

export interface Error {
    id: number;
    content: string;
}
export interface Biometrics {
    fingerprint?: string;
    voice?: string;
    face?: string;
}

export interface Friend {
    id: string;
    name: string;
    lastname: string;
    mail: string;
    avatar: string;
    settings: {
        nickname: string;
        PIN: number;
    };
    messages: {
        content: string;
        date: string;
        sender: string;
    }[];
}

export interface UserDocument extends Document {
    name: string;
    lastname: string;
    mail: string;
    password: string;
    avatar?: string;
    status: string;
    biometrics?: Biometrics;
    friends: Friend[];
    chatbots: any[]; // Typ dla chatbots może być dowolny
}