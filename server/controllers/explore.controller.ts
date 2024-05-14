import { Request, Response } from "express";
import userModel from "../models/users.model";

export const findUsers = async (req: Request, res: Response): Promise<void> => {
    const { yourID, searchInputValue } = req.body;
    if (!yourID) return;
    try {
        const users = await userModel.find({
            $and: [
                { _id: { $ne: yourID } },
                {
                    $or: [
                        { name: { $regex: searchInputValue, $options: "i" } },
                        { lastname: { $regex: searchInputValue, $options: "i" } },
                        { mail: { $regex: searchInputValue, $options: "i" } }
                    ]
                }
            ]
        }, { mail: 1, name: 1, lastname: 1, avatar: 1 });
        if (users.length === 0) res.send({ message: "No users found!" });
        else res.send(users);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const getRequests = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;
    if (!id) return;
    try {
        const user = await userModel.find({
            "requests.received": id
        },
            { mail: 1, name: 1, lastname: 1, avatar: 1 });

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        res.json(user);
    } catch (error) {
        console.error("Error while finding user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const sendRequest = async (req: Request, res: Response): Promise<void> => {
    const { yourID, personID } = req.body;
    if (!yourID) return;
    try {
        await userModel.findByIdAndUpdate(
            personID,
            { $push: { "requests.received": yourID } },
            { new: true }
        );
        await userModel.findByIdAndUpdate(
            yourID,
            { $push: { "requests.sent": personID } },
            { new: true }
        );

        res.send({ message: "Request sent successfully" });
    } catch (error) {
        console.error("Error while sending request:", error);
        res.status(500).send({ message: "Internal server error" });
    }
};

export const cancelRequest = async (req: Request, res: Response): Promise<void> => {
    const { yourID, personID } = req.body;
    if (!yourID) return;
    try {
        await userModel.findByIdAndUpdate(
            personID,
            { $pull: { "requests.received": yourID } },
            { new: true }
        );
        await userModel.findByIdAndUpdate(
            yourID,
            { $pull: { "requests.sent": personID } },
            { new: true }
        );

        res.send({ message: "Request cancelled successfully" });
    } catch (error) {
        console.error("Error while cancelling request:", error);
        res.status(500).send({ message: "Internal server error" });
    }
};