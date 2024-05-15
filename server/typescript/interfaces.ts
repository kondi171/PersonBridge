import { Document } from "mongoose";
import { Biometrics, Message } from "./types";
import { UserStatus } from "./enums";

// export interface User {
//     _id: string,
//     name: string,
//     lastname: string,
//     mail: string,
//     password: string,
//     avatar: string,
//     status: string,
//     biometrics: {
//         fingerprint: string,
//         voice: string,
//         face: string,
//     },
//     friends: Friend[],
//     requests: {
//         received: string[],
//         sent: string[]
//     },
//     blocked: string[],
//     chatbots: []
// }

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
    id: string,
    settings: {
        nickname: string,
        PIN: string,
    },
    messages: Message[]
}
