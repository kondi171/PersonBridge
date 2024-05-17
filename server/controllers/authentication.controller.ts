import { Request, Response } from "express";
import userModel from "../models/users.model";
import bcrypt from 'bcrypt';

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