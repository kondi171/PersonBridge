import { Request, Response } from "express";
import userModel from "../models/users.model";

export const getUser = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;
    try {
        const user = await userModel.findOne({ _id: id });
        res.send(user);
    } catch (error) {
        res.status(500).send(error);
    }
};