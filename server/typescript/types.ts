import "express-session";

// declare module "express-session" {
//     interface SessionData {
//         user?: { id: string; mail: string; name: string; lastname: string };
//     }
// }

export type Friend = {
    id: string,
    settings: {
        nickname: string,
        PIN: string,
    },
    messages: Message[]
}

export type Message = {
    content: string,
    date: string,
    sender: string
}