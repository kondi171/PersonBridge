import { Request, Response } from "express";
import userModel from "../models/users.model";
import { MessageSender } from "../typescript/interfaces";

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

        const results = friends.map(friend => {
            const friendData = friendsData.find(f => f.id === friend._id.toString());
            const youLastMessage = friendData && friendData.messages.length > 0
                ? friendData.messages.slice().reverse().find(message => message.sender === MessageSender.YOU)
                : null;
            const friendLastMessage = friendData && friendData.messages.length > 0
                ? friendData.messages.slice().reverse().find(message => message.sender === MessageSender.FRIEND)
                : null;

            return {
                id: friend._id,
                name: friend.name,
                lastname: friend.lastname,
                avatar: friend.avatar,
                status: friend.status,
                lastMessage: {
                    you: youLastMessage || { content: '', date: null, sender: MessageSender.YOU, read: false },
                    friend: friendLastMessage || { content: '', date: null, sender: MessageSender.FRIEND, read: false }
                },
                settings: friendData ? friendData.settings : null,
                accessibility: friendData ? friendData.accessibility : null
            };
        }).filter(friend => friend.lastMessage.you.content !== '' || friend.lastMessage.friend.content !== '');

        res.json(results);
    } catch (error) {
        res.status(500).send(error);
    }
};
