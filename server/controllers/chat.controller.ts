import { Request, Response } from "express";
import userModel from "../models/users.model";
import { MessageSender } from "../typescript/enums";
import bcrypt from 'bcrypt';

export const getUserChat = async (req: Request, res: Response): Promise<void> => {
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
        const friendData = await userModel.findById(friendID).select('name lastname avatar status blocked');
        if (!friendData) {
            res.status(404).json({ message: "Friend data not found" });
            return;
        }
        res.json({
            friend: {
                id: friendData._id,
                name: friendData.name,
                lastname: friendData.lastname,
                avatar: friendData.avatar,
                status: friendData.status,
                accessibility: friendRelation.accessibility,
                settings: friendRelation.settings,
                blocked: friendData.blocked
            },
            messages: friendRelation.messages
        });
    } catch (error) {
        res.status(500).send(error);
    }
};

export const sendMessage = async (req: Request, res: Response): Promise<void> => {
    const { yourID, friendID, message } = req.body;
    if (!yourID || !friendID || !message) {
        res.status(400).json({ message: "Message, User and Friend IDs are required" });
        return;
    }
    try {
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

        const newMessage = {
            content: message,
            date: new Date(),
            sender: MessageSender.YOU,
            read: true
        };
        friend.messages.push(newMessage);

        await userModel.findByIdAndUpdate(yourID, { friends: user.friends });

        const friendDocument = await userModel.findById(friendID);
        if (!friendDocument) {
            res.status(404).json({ message: "Friend user not found" });
            return;
        }
        const userInFriend = friendDocument.friends.find(f => f.id === yourID);
        if (userInFriend) {
            if (!userInFriend.accessibility.ignore) {
                const messageForFriend = {
                    content: message,
                    date: new Date(),
                    sender: MessageSender.FRIEND,
                    read: false
                };
                userInFriend.messages.push(messageForFriend);
                await userModel.findByIdAndUpdate(friendID, { friends: friendDocument.friends });
            }
        }
        res.status(200).json({ message: "Message sent successfully" });
    } catch (error) {
        console.error("Error sending message: ", error);
        res.status(500).json({ message: "Error sending message" });
    }
};

export const markMessagesAsRead = async (req: Request, res: Response): Promise<void> => {
    const { yourID, friendID } = req.body;

    if (!yourID || !friendID) {
        res.status(400).json({ message: "User ID and Friend ID are required" });
        return;
    }

    try {
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

        // Oznacz wszystkie wiadomości jako przeczytane
        friend.messages.forEach(message => {
            message.read = true;
        });

        await user.save();

        res.status(200).json({ message: "All messages marked as read" });
    } catch (error) {
        console.error("Error marking messages as read: ", error);
        res.status(500).json({ message: "Error marking messages as read" });
    }
};

export const forgetPIN = async (req: Request, res: Response): Promise<void> => {
    const { yourID, password } = req.body;

    if (!yourID) {
        res.status(400).json({ message: "User ID is required" });
        return;
    }
    if (!password) {
        res.status(400).json({ message: "Password is required" });
        return;
    }

    try {
        // Znajdź użytkownika
        const user = await userModel.findById(yourID);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        // Sprawdź hasło użytkownika
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.json({ success: false, message: 'Invalid password' });
            return;
        }

        // Jeżeli hasło się zgadza, zwróć true
        res.json({ success: true });

    } catch (error) {
        console.error('Error verifying password:', error);
        res.status(500).json({ message: 'An error occurred', error });
    }
};
