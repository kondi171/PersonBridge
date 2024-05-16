import "express-session";
import { MessageSender } from "./enums";

// declare module "express-session" {
//     interface SessionData {
//         user?: { id: string; mail: string; name: string; lastname: string };
//     }
// }

export type Message = {
    content: string,
    date: Date,
    sender: MessageSender
}

export type Biometrics = {
    fingerprint: string;
    voice: string;
    face: string;
}