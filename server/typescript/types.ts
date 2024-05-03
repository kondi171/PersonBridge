import "express-session";

declare module "express-session" {
    interface SessionData {
        user?: { id: string; mail: string; name: string; lastname: string };
    }
}