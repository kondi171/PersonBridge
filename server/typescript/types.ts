import "express-session";

// declare module "express-session" {
//     interface SessionData {
//         user?: { id: string; mail: string; name: string; lastname: string };
//     }
// }

export type Message = {
    content: string,
    date: Date,
    sender: string
}

export type Biometrics = {
    fingerprint: string;
    voice: string;
    face: string;
}