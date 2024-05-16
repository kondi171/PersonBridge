import { Request, Response } from "express";
import userModel from "../models/users.model";
import { MessageSender } from "../typescript/enums";

export const getFriendSettings = async (req: Request, res: Response): Promise<void> => {
    const { yourID, friendID } = req.params;

    if (!yourID || !friendID) {
        res.status(400).json({ message: "Both User and Friend IDs are required" });
        return;
    } try {
        const user = await userModel.findById(yourID);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const friendRelation = user.friends.find(friend => friend.id === friendID);
        if (!friendRelation) {
            res.status(404).json({ message: "Friend not found" });
            return;
        }
        const friendData = await userModel.findById(friendID).select('name lastname mail avatar');
        if (!friendData) {
            res.status(404).json({ message: "Friend data not found" });
            return;
        }
        res.json({
            friend: {
                id: friendData._id,
                name: friendData.name,
                lastname: friendData.lastname,
                mail: friendData.mail,
                avatar: friendData.avatar,
                accessibility: friendRelation.accessibility,
                settings: friendRelation.settings
            },
            messages: friendRelation.messages
        });
    } catch (error) {
        res.status(500).send(error);
    }
};

export const setMute = async (req: Request, res: Response): Promise<void> => {
    const { yourID, friendID } = req.body;
    if (!yourID || !friendID) {
        res.status(400).json({ message: "Both User and Friend IDs are required" });
        return;
    } try {
        const user = await userModel.findById(yourID);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const friend = user.friends.find((friend: any) => friend.id === friendID);
        if (!friend) {
            res.status(404).json({ message: "Friend not found" });
            return;
        }
        friend.accessibility.mute = !friend.accessibility.mute;
        await user.save();
        res.status(200).json({ mute: friend.accessibility.mute });
    } catch (error) {
        res.status(500).send(error);
    }
};

export const setIgnore = async (req: Request, res: Response): Promise<void> => {
    const { yourID, friendID } = req.body;
    if (!yourID || !friendID) {
        res.status(400).json({ message: "Both User and Friend IDs are required" });
        return;
    } try {
        const user = await userModel.findById(yourID);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const friend = user.friends.find((friend: any) => friend.id === friendID);
        if (!friend) {
            res.status(404).json({ message: "Friend not found" });
            return;
        }
        friend.accessibility.ignore = !friend.accessibility.ignore;
        await user.save();
        res.status(200).json({ ignore: friend.accessibility.ignore });
    } catch (error) {
        res.status(500).send(error);
    }
};

export const setBlock = async (req: Request, res: Response): Promise<void> => {
    const { yourID, friendID } = req.body;

    if (!yourID || !friendID) {
        res.status(400).json({ message: "Both User and Friend IDs are required" });
        return;
    } try {
        const user = await userModel.findById(yourID);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const friend = user.friends.find((friend: any) => friend.id === friendID);
        if (!friend) {
            res.status(404).json({ message: "Friend not found" });
            return;
        }
        const friendUser = await userModel.findById(friendID);

        if (!friendUser) {
            res.status(404).json({ message: "Friend user not found" });
            return;
        }
        friend.accessibility.block = !friend.accessibility.block;
        const messageContent = friend.accessibility.block ? "blocked" : "unblocked";
        friend.messages.push({
            content: `You ${messageContent} ${friend.settings.nickname}`,
            date: new Date(),
            sender: MessageSender.SYSTEM
        });

        const userMessage = friendUser.friends.find((f: any) => f.id === yourID);
        if (userMessage) {
            userMessage.messages.push({
                content: `${user.name} ${messageContent} you`,
                date: new Date(),
                sender: MessageSender.SYSTEM
            });
        }

        if (friend.accessibility.block) {
            if (!user.blocked.includes(friendID)) {
                user.blocked.push(friendID);
            }
        } else {
            user.blocked = user.blocked.filter((id: string) => id !== friendID);
        }
        await user.save();
        await friendUser.save();
        res.status(200).json({ block: friend.accessibility.block });
    } catch (error) {
        res.status(500).send(error);
    }
};
