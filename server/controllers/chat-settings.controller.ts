import { Request, Response } from "express";
import userModel from "../models/user.model";
import { MessageSender } from "../typescript/enums";
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

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
                _id: friendData._id,
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
        const messageID: string = uuidv4();
        friend.messages.push({
            id: messageID,
            content: `You ${messageContent} ${friend.settings.nickname}`,
            date: new Date(),
            sender: MessageSender.SYSTEM,
            read: false,
            reactions: []
        });

        const userMessage = friendUser.friends.find((f: any) => f.id === yourID);
        if (userMessage) {
            userMessage.messages.push({
                id: messageID,
                content: `${user.name} ${messageContent} you`,
                date: new Date(),
                sender: MessageSender.SYSTEM,
                read: false,
                reactions: []
            });
        }

        if (friend.accessibility.block) {
            if (!user.blocked.includes(friendID)) {
                user.blocked.push(friendID);
            }
        } else {
            user.blocked = user.blocked.filter((_id: string) => _id !== friendID);
        }
        await user.save();
        await friendUser.save();
        res.status(200).json({ block: friend.accessibility.block });
    } catch (error) {
        res.status(500).send(error);
    }
};


export const deleteMessages = async (req: Request, res: Response): Promise<void> => {
    const { yourID, friendID, password } = req.body;

    if (!yourID || !friendID) {
        res.status(400).json({ message: "User ID and Friend ID are required" });
        return;
    }
    if (!password) {
        res.status(400).json({ message: "Password is required" });
        return;
    } try {
        const user = await userModel.findById(yourID);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.json({ message: 'Invalid password' });
            return;
        }
        const friend = user.friends.find(f => f.id === friendID);
        if (!friend) {
            res.status(404).json({ message: "Friend not found in user's friend list" });
            return;
        }
        friend.messages = [];
        await user.save();
        res.send({ message: 'All messages deleted successfully' });
    } catch (error) {
        console.error('Failed to delete messages:', error);
        res.status(500).send({ message: 'An error occurred', error });
    }
};

export const removeFriend = async (req: Request, res: Response): Promise<void> => {
    const { yourID, friendID, password } = req.body;

    if (!yourID || !friendID) {
        res.status(400).json({ message: "User ID and Friend ID are required" });
        return;
    }
    if (!password) {
        res.status(400).json({ message: "Password is required" });
        return;
    } try {
        const user = await userModel.findById(yourID);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.json({ message: 'Invalid password' });
            return;
        }

        const friendUser = await userModel.findById(friendID);
        if (!friendUser) {
            res.status(404).json({ message: "Friend not found" });
            return;
        }

        friendUser.friends = friendUser.friends.filter(f => f.id !== yourID);
        await friendUser.save();

        user.friends = user.friends.filter(f => f.id !== friendID);
        await user.save();

        res.send({ message: 'Friend removed successfully' });
    } catch (error) {
        console.error('Failed to remove friend:', error);
        res.status(500).send({ message: 'An error occurred', error });
    }
};

export const setPIN = async (req: Request, res: Response): Promise<void> => {
    const { yourID, friendID, PIN } = req.body;

    if (!yourID || !friendID) {
        res.status(400).json({ message: "User ID and Friend ID are required" });
        return;
    }
    if (!PIN) {
        res.status(400).json({ message: "PIN is required" });
        return;
    } try {
        const user = await userModel.findById(yourID);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        const friend = user.friends.find(f => f.id === friendID);
        if (!friend) {
            res.status(404).json({ message: "Friend not found in user's friend list" });
            return;
        }

        friend.settings = friend.settings || {};
        friend.settings.PIN = PIN;

        await user.save();

        res.json({ message: 'PIN set successfully', friend });
    } catch (error) {
        console.error('Failed to set PIN:', error);
        res.status(500).json({ message: 'An error occurred', error });
    }
};

export const removePIN = async (req: Request, res: Response): Promise<void> => {
    const { yourID, friendID } = req.body;

    if (!yourID || !friendID) {
        res.status(400).json({ message: "User ID and Friend ID are required" });
        return;
    } try {

        const user = await userModel.findById(yourID);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        const friend = user.friends.find(f => f.id === friendID);
        if (!friend) {
            res.status(404).json({ message: "Friend not found in user's friend list" });
            return;
        }

        friend.settings = friend.settings || {};
        friend.settings.PIN = 0;

        await user.save();

        res.json({ message: 'PIN removed successfully', friend });
    } catch (error) {
        console.error('Failed to remove PIN:', error);
        res.status(500).json({ message: 'An error occurred', error });
    }
};

export const setNickname = async (req: Request, res: Response): Promise<void> => {
    const { yourID, friendID, nickname } = req.body;

    if (!yourID || !friendID) {
        res.status(400).json({ message: "User ID and Friend ID are required" });
        return;
    }
    if (!nickname) {
        res.status(400).json({ message: "Nickname is required" });
        return;
    } try {

        const user = await userModel.findById(yourID);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        const friend = user.friends.find(f => f.id === friendID);
        if (!friend) {
            res.status(404).json({ message: "Friend not found in user's friend list" });
            return;
        }

        friend.settings = friend.settings || {};
        friend.settings.nickname = nickname;

        await user.save();

        res.json({ message: 'Nickname set successfully', friend });
    } catch (error) {
        console.error('Failed to set nickname:', error);
        res.status(500).json({ message: 'An error occurred', error });
    }
};