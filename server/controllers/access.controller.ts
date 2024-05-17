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

export const getUserFriendsWithMessages = async (req: Request, res: Response): Promise<void> => {
    const userId = req.params.id;
    if (!userId) {
        res.status(400).json({ message: "User ID is required" });
        return;
    }
    try {
        const user = await userModel.findById(userId);
        if (!user) {
            res.status(404).json({ message: "User not found." });
            return;
        }

        const friendsData = user.friends.map(friend => friend);
        const friendsIDs = user.friends.map(friend => friend.id);
        if (friendsData.length === 0) {
            res.status(200).json([]);
            return;
        }

        const friends = await userModel.find({
            '_id': { $in: friendsIDs }
        });
        console.log(friends)
        const results = friends.map(friend => {
            const friendData = friendsData.find(f => f.id === friend._id.toString());
            const lastMessage = friendData && friendData.messages.length > 0
                ? friendData.messages[friendData.messages.length - 1]
                : null;

            return {
                id: friend._id,
                name: friend.name,
                lastname: friend.lastname,
                avatar: friend.avatar,
                status: friend.status,
                lastMessage: lastMessage
            };
        }).filter(friend => friend.lastMessage !== null);

        res.json(results);
    } catch (error) {
        res.status(500).send(error);
    }
};
