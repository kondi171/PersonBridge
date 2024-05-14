import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from 'jsonwebtoken';
import { generateSecretKey } from "./crypto.middleware";
import { User } from "../typescript/interfaces";

declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}



// const SECRET_KEY: string = generateSecretKey(32);
const SECRET_KEY: string = '405dbe2246969eee7a6b96ead6ce04dd4c19b951395d82b0b173d24a9c637204';

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader: string | undefined = req.headers.authorization;
    const token: string | undefined = authHeader?.split(' ')[1];

    if (!token) {
        res.sendStatus(401);
        return;
    }

    jwt.verify(token, SECRET_KEY, {}, (err: Error | null, decoded: string | JwtPayload | undefined) => {
        if (err) {
            res.sendStatus(403);
            return;
        }
        if (typeof decoded === 'object' && decoded !== null) {
            req.user = decoded as User;
            next();
        } else {
            res.sendStatus(401);
            return;
        }
    });
};
