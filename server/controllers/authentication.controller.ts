import { Request, Response } from "express";
import userModel from "../models/users.model";

declare module 'express-session' {
    export interface SessionData {
        // @ts-ignore
        user: { [key: string]: any };
    }
}
export const loginUser = async (req: Request, res: Response): Promise<void> => {
    const mail: string = req.body.mail;
    const password: string = req.body.password;
    try {
        const user = await userModel.findOne({ mail, password });
        if (user) {
            req.session.user = {
                id: user._id.toString(),
                mail: user.mail,
                name: user.name,
                lastname: user.lastname,
                avatar: user.avatar
            };
            res.send(user);
            // res.send(req.session.user);
        } else {
            res.send({ message: 'No user found!' });
        }
        // console.log(req.session.user)
    } catch (error) {
        res.status(500).send(error);
    }
};

export const registerUser = async (req: Request, res: Response): Promise<void> => {
    const { mail, name, lastname, password } = req.body;
    const isRegistered = await userModel.findOne({ mail: mail });
    console.log(req.body)
    if (isRegistered) res.send({ message: 'The specified user already exists!' });
    else {
        try {
            const user = new userModel({ mail: mail.toLowerCase(), name: name, lastname: lastname, password: password });
            await user.save();
            res.send({ message: 'User successfully registered!' })
        } catch (error) {
            res.status(500).send(error);
        }
    }
}
