import { Request, Response } from "express";
import userModel from "../models/user.model";
import { MessageSender } from "../typescript/enums";
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { Message } from "../typescript/interfaces";

export const getUserChat = async (req: Request, res: Response): Promise<void> => {
    const { yourID, friendID } = req.params;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const offset = parseInt(req.query.offset as string, 10) || 0;
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

        const messages = friendRelation.messages.slice(offset, offset + limit);

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
            messages: messages
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

        const messageID: string = uuidv4();
        const newMessage = {
            id: messageID,
            content: message,
            date: new Date(),
            sender: MessageSender.YOU,
            read: false,
            reactions: []
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
                    id: messageID,
                    content: message,
                    date: new Date(),
                    sender: MessageSender.FRIEND,
                    read: false,
                    reactions: []
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
    } try {
        const user = await userModel.findById(yourID);
        const friend = await userModel.findById(friendID);

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        if (!friend) {
            res.status(404).json({ message: "Friend not found" });
            return;
        }

        const friendInUser = user.friends.find(f => f.id === friendID);
        const userInFriend = friend.friends.find(f => f.id === yourID);

        if (!friendInUser) {
            res.status(404).json({ message: "Friend not found in user's friend list" });
            return;
        }

        if (!userInFriend) {
            res.status(404).json({ message: "User not found in friend's friend list" });
            return;
        }
        friendInUser.messages.forEach(message => {
            if (message.sender === MessageSender.FRIEND) {
                message.read = true;
            }
        });

        userInFriend.messages.forEach(message => {
            if (message.sender === MessageSender.YOU) {
                message.read = true;
            }
        });
        await user.save();
        await friend.save();

        res.status(200).json({ message: "All messages from friend marked as read" });
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
    } try {

        const user = await userModel.findById(yourID);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.json({ success: false, message: 'Invalid password' });
            return;
        }

        res.json({ success: true });

    } catch (error) {
        console.error('Error verifying password:', error);
        res.status(500).json({ message: 'An error occurred', error });
    }
};


export const addReaction = async (req: Request, res: Response): Promise<void> => {
    const { yourID, friendID, messageID, reaction } = req.body;

    if (!yourID || !friendID || !messageID || !reaction) {
        res.status(400).json({ message: "Missing required fields" });
        return;
    } try {

        const user = await userModel.findById(yourID);
        const friend = await userModel.findById(friendID);

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        if (!friend) {
            res.status(404).json({ message: "Friend not found" });
            return;
        }

        const friendInUser = user.friends.find(f => f.id === friendID);
        const messageInFriend = friendInUser?.messages.find(m => m.id === messageID);

        if (!messageInFriend) {
            res.status(404).json({ message: "Message not found in friend's messages" });
            return;
        }

        const userInFriend = friend.friends.find(f => f.id === yourID);
        const messageInUser = userInFriend?.messages.find(m => m.id === messageID);

        if (!messageInUser) {
            res.status(404).json({ message: "Message not found in user's messages" });
            return;
        }

        const updateReaction = (message: Message) => {
            const existingReaction = message.reactions.find(r => r.userID === reaction.userID);
            if (existingReaction) {
                existingReaction.emoticon = reaction.emoticon;
            } else {
                message.reactions.push(reaction);
            }
        };

        updateReaction(messageInFriend);
        updateReaction(messageInUser);

        const systemMessageContentForFriend = `${user.name} reacted to ${friend.name}'s message with ${reaction.emoticon}`;
        const systemMessageContentForUser = `${user.name} reacted to ${user.name}'s message with ${reaction.emoticon}`;

        const systemMessageIDForFriend: string = uuidv4();
        const systemMessageForFriend = {
            id: systemMessageIDForFriend,
            content: systemMessageContentForFriend,
            date: new Date(),
            sender: MessageSender.SYSTEM,
            read: false,
            reactions: []
        };

        const systemMessageIDForUser: string = uuidv4();
        const systemMessageForUser = {
            id: systemMessageIDForUser,
            content: systemMessageContentForUser,
            date: new Date(),
            sender: MessageSender.SYSTEM,
            read: false,
            reactions: []
        };
        if (friendInUser && userInFriend) {
            friendInUser.messages.push(systemMessageForFriend);
            userInFriend.messages.push(systemMessageForUser);
        }

        await user.save();
        await friend.save();

        res.status(200).json({ message: "Reaction added/updated and system messages sent successfully" });
    } catch (error) {
        console.error("Error while adding/updating reaction:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
