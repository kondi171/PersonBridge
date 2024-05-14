import { Request, Response } from "express";
import userModel from "../models/users.model";

export const getUser = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;
    if (!id) return;
    try {
        const user = await userModel.findOne({ _id: id });
        res.send(user);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const sendMessage = async (req: Request, res: Response): Promise<void> => {
    const yourID = req.body.yourID;
    const personID = req.body.personID;
    const message = req.body.message;
    if (!yourID) return;
    try {
        const you = await userModel.findOne({ _id: yourID });

        if (!you) {
            res.status(404).send({ message: "Nie znaleziono użytkownika." });
            return;
        }

        const friendIndex = you.friends.findIndex((friend) => friend.id === personID);

        if (friendIndex === -1) {
            res.status(404).send({ message: "Nie znaleziono przyjaciela." });
            return;
        }
        const today = new Date();
        const date = `${today.getDate() > 10 ? today.getDate() : '0' + today.getDate()}.${today.getMonth() + 1 > 10 ? today.getMonth() + 1 : '0' + (today.getMonth() + 1)}.${today.getFullYear()} ${today.getHours()}:${today.getMinutes() > 10 ? today.getMinutes() : '0' + today.getMinutes()}`
        you.friends[friendIndex].messages.push({
            content: message.content,
            date: date,
            sender: message.sender
        });
        await you.save();
        res.send({ message: "Wiadomość została wysłana." });
    } catch (error) {
        console.error("Błąd podczas zapisywania danych użytkownika:", error);
        res.status(500).send(error);
    }
}


