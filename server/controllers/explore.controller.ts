import { Request, Response } from "express";
import userModel from "../models/user.model";
import { getIo } from "../middlewares/websocket.middleware";

export const findUsers = async (req: Request, res: Response): Promise<void> => {
    const { yourID, searchInputValue, limit = 20, offset = 0 } = req.body;
    if (!yourID) {
        res.status(400).json({ message: "Missing user ID" });
        return;
    } try {
        const currentUser = await userModel.findById(yourID, 'friends');
        if (!currentUser) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        const friendsIDs = currentUser.friends.map(friend => friend.id);
        const users = await userModel.find({
            $and: [
                { _id: { $nin: [yourID, ...friendsIDs] } },
                {
                    $or: [
                        { name: { $regex: searchInputValue, $options: "i" } },
                        { lastname: { $regex: searchInputValue, $options: "i" } },
                        { mail: { $regex: searchInputValue, $options: "i" } }
                    ]
                }
            ]
        }, { mail: 1, name: 1, lastname: 1, avatar: 1 })
            .skip(offset)
            .limit(limit);

        const formattedUsers = users.map(user => ({
            id: user._id,
            mail: user.mail,
            name: user.name,
            lastname: user.lastname,
            avatar: user.avatar
        }));

        if (formattedUsers.length === 0) {
            res.send({ message: "No users found!" });
        } else {
            res.send(formattedUsers);
        }
    } catch (error) {
        console.error('Error during findUsers operation:', error);
        res.status(500).json({ message: "An error occurred during the search.", error: error });
    }
};

export const getRequests = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;
    if (!id) {
        res.status(400).json({ message: "Missing user ID" });
        return;
    } try {
        const users = await userModel.find({
            "requests.received": id
        },
            { mail: 1, name: 1, lastname: 1, avatar: 1 });

        if (!users) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const formattedUsers = users.map(user => ({
            id: user._id,
            mail: user.mail,
            name: user.name,
            lastname: user.lastname,
            avatar: user.avatar
        }));
        res.json(formattedUsers);
    } catch (error) {
        console.error("Error while finding user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getSentRequests = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;
    if (!id) {
        res.status(400).json({ message: "Missing user ID" });
        return;
    } try {
        const user = await userModel.findById(id);
        if (!user) {
            res.status(400).json({ message: "User not found" });
            return;
        }
        const sentRequest = user.requests.sent;
        res.json(sentRequest);
    } catch (error) {
        console.error("Error while finding user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const sendRequest = async (req: Request, res: Response): Promise<void> => {
    const { yourID, personID } = req.body;
    if (!yourID || !personID) {
        res.status(400).json({ message: "Missing user ID or Friend ID" });
        return;
    }
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

        const io = getIo();
        io.to(personID).emit('sendRequest', { from: yourID });

        res.send({ message: "Request sent successfully" });
    } catch (error) {
        console.error("Error while sending request:", error);
        res.status(500).send({ message: "Internal server error" });
    }
};

export const cancelRequest = async (req: Request, res: Response): Promise<void> => {
    const { yourID, personID } = req.body;
    if (!yourID && !personID) {
        res.status(400).json({ message: "Missing user ID or Friend ID" });
        return;
    } try {
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

        const io = getIo();
        io.to(personID).emit('cancelRequest', { from: yourID });

        res.send({ message: "Request cancelled successfully" });
    } catch (error) {
        console.error("Error while cancelling request:", error);
        res.status(500).send({ message: "Internal server error" });
    }
};