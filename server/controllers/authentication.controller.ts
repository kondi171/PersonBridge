import { Request, Response } from "express";
import userModel from "../models/users.model";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { generateSecretKey } from "../middlewares/crypto.middleware";

declare module 'express-session' {
    export interface SessionData {
        // @ts-ignore
        user: { [key: string]: any };
    }
}
const SECRET_KEY = '405dbe2246969eee7a6b96ead6ce04dd4c19b951395d82b0b173d24a9c637204';
// export const loginUser = async (req: Request, res: Response): Promise<void> => {
//     const mail: string = req.body.mail;
//     const password: string = req.body.password;
//     try {
//         const user = await userModel.findOne({ mail });
//         if (user) {
//             const isMatch = await bcrypt.compare(password, user.password);
//             if (isMatch) {
//                 res.send(user);
//             }
//         }
//         // if (user) {
//         //     req.session.user = {
//         //         id: user._id.toString(),
//         //         mail: user.mail,
//         //         name: user.name,
//         //         lastname: user.lastname,
//         //         avatar: user.avatar
//         //     };
//         //     res.send(user);
//         //     // res.send(req.session.user);
//         // } 
//         else {
//             res.send({ message: 'No user found!' });
//         }
//         // console.log(req.session.user)
//     } catch (error) {
//         res.status(500).send(error);
//     }
// };



export const loginUser = async (req: Request, res: Response): Promise<void> => {
    const { mail, password } = req.body;
    try {
        const user = await userModel.findOne({ mail });
        if (!user) {
            res.send({ message: 'Invalid credentials!' });
            return;
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            // Utworzenie tokena JWT
            // const payload = { userId: user._id };
            // const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });  // Token ważny przez 1 godzinę
            // res.json({ message: 'Logged in successfully!', token });
            res.send(user);
        } else {
            res.send({ message: 'Invalid credentials!' });
        }
    } catch (error) {
        res.status(500).send(error);
    }
};


export const registerUser = async (req: Request, res: Response): Promise<void> => {
    const { mail, name, lastname, password } = req.body;
    const isRegistered = await userModel.findOne({ mail: mail });
    if (isRegistered) {
        res.send({ message: 'The specified user already exists!' });
    } else {
        try {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            const user = new userModel({
                mail: mail.toLowerCase(),
                name: name,
                lastname: lastname,
                password: hashedPassword
            });

            await user.save();
            res.send({ message: 'User successfully registered!' });
        } catch (error) {
            res.status(500).send(error);
        }
    }
}