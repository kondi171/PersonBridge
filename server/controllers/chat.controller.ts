import { Request, Response } from "express";
import userModel from "../models/user.model";
import { UserStatus } from "../typescript/enums";
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { Participant } from "../typescript/types";
import { getIo } from "../middlewares/websocket.middleware";

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

export const getGroupChat = async (req: Request, res: Response): Promise<void> => {
    const { yourID, groupID } = req.params;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const offset = parseInt(req.query.offset as string, 10) || 0;
    if (!yourID || !groupID) {
        res.status(400).json({ message: "Both User and Group IDs are required" });
        return;
    }

    try {
        const user = await userModel.findById(yourID);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        const groupRelation = user.groups.find((group: any) => group.id === groupID);
        if (!groupRelation) {
            res.status(404).json({ message: "Group not found" });
            return;
        }
        const filteredParticipants = groupRelation.participants.filter((participant: Participant) => participant.id !== yourID);
        const participantIDs = filteredParticipants.map((participant: Participant) => participant.id);

        // Pobierz dane uczestników grupy z bazy danych
        const groupParticipants = await userModel.find({ _id: { $in: participantIDs } }, 'status avatar name');

        // Ustal status grupy
        let groupStatus = UserStatus.OFFLINE;
        if (groupParticipants.some((participant: any) => participant.status === UserStatus.ONLINE)) {
            groupStatus = UserStatus.ONLINE;
        }

        // Mapowanie danych uczestników do żądanej struktury
        const participants = groupParticipants.map((participant: any) => ({
            id: participant._id,
            status: participant.status,
            avatar: participant.avatar,
            nickname: participant.name  // zakładając, że name jest polem z imieniem użytkownika
        }));

        const messages = groupRelation.messages.slice(offset, offset + limit);

        const response = {
            id: groupRelation.id,
            name: groupRelation.name,
            avatar: groupRelation.avatar,
            status: groupStatus,
            administrator: groupRelation.administrator,
            PIN: groupRelation.PIN,
            participants: participants,
            messages: messages
        }
        res.json(response);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const sendMessageToUser = async (req: Request, res: Response): Promise<void> => {
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
            sender: user._id,
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
                    sender: userInFriend.id,
                    read: false,
                    reactions: []
                };
                userInFriend.messages.push(messageForFriend);
                await userModel.findByIdAndUpdate(friendID, { friends: friendDocument.friends });
            }
        }

        const io = getIo();
        io.to(friendID).emit('messageToUserSend', { from: yourID });

        res.status(200).json({ message: "Message sent successfully" });
    } catch (error) {
        console.error("Error sending message: ", error);
        res.status(500).json({ message: "Error sending message" });
    }
};

export const sendMessageToGroup = async (req: Request, res: Response): Promise<void> => {
    const { yourID, groupID, message } = req.body;
    if (!yourID || !groupID || !message) {
        res.status(400).json({ message: "Message, User and Group IDs are required" });
        return;
    }

    try {
        const user = await userModel.findById(yourID);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        const group = user.groups.find(group => group.id === groupID);
        if (!group) {
            res.status(404).json({ message: "Group not found in user's groups" });
            return;
        }

        const messageID: string = uuidv4();
        const newMessage = {
            id: messageID,
            content: message,
            date: new Date(),
            sender: user._id,
            read: false,
            reactions: []
        };

        group.messages.push(newMessage);
        await userModel.findByIdAndUpdate(yourID, { groups: user.groups });

        const participants = await userModel.find({ 'groups.id': groupID });

        const updateOperations = participants.map(async participant => {
            if (participant._id.toString() !== yourID) {
                const groupInParticipant = participant.groups.find(g => g.id === groupID);
                if (groupInParticipant) {
                    const messageForGroup = {
                        id: messageID,
                        content: message,
                        date: new Date(),
                        sender: user._id,
                        read: false,
                        reactions: []
                    };
                    groupInParticipant.messages.push(messageForGroup);
                    await userModel.findByIdAndUpdate(participant._id, { groups: participant.groups });
                }
            }
        });

        await Promise.all(updateOperations);

        res.status(200).json({ message: "Message sent successfully to group" });
    } catch (error) {
        console.error("Error sending message to group: ", error);
        res.status(500).json({ message: "Error sending message to group" });
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

        let messagesUpdated = false;
        friendInUser.messages.forEach(message => {
            if (message.sender === friendID && !message.read) {
                message.read = true;
                messagesUpdated = true;
            }
        });

        if (messagesUpdated) {
            await user.save();
        }

        messagesUpdated = false;

        userInFriend.messages.forEach(message => {
            if (message.sender === friendID && !message.read) {
                message.read = true;
                messagesUpdated = true;
            }
        });

        if (messagesUpdated) {
            await friend.save();
        }

        const io = getIo();
        io.to(friendID).emit('markMessageAsRead', { from: yourID });

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
    const { yourID, friendID, groupID, messageID, reaction, participants: participantIDs } = req.body;

    if (!yourID || !messageID || !reaction || (!friendID && !groupID)) {
        res.status(400).json({ message: "Missing required fields" });
        return;
    }

    try {
        const user = await userModel.findById(yourID);

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        const updateReaction = (message: any) => {
            const existingReaction = message.reactions.find((r: any) => r.userID === reaction.userID);
            if (existingReaction) {
                existingReaction.emoticon = reaction.emoticon;
            } else {
                message.reactions.push(reaction);
            }
        };

        if (friendID) {
            const friend = await userModel.findById(friendID);

            if (!friend) {
                res.status(404).json({ message: "Friend not found" });
                return;
            }

            const friendInUser = user.friends.find((f: any) => f.id === friendID);
            const messageInFriend = friendInUser?.messages.find((m: any) => m.id === messageID);

            if (!messageInFriend) {
                res.status(404).json({ message: "Message not found in friend's messages" });
                return;
            }

            const userInFriend = friend.friends.find((f: any) => f.id === yourID);
            const messageInUser = userInFriend?.messages.find((m: any) => m.id === messageID);

            if (!messageInUser) {
                res.status(404).json({ message: "Message not found in user's messages" });
                return;
            }

            updateReaction(messageInFriend);
            updateReaction(messageInUser);

            let systemMessageContentForFriend: string;
            let systemMessageContentForUser: string;

            if (messageInFriend.sender === yourID) {
                systemMessageContentForFriend = `${user.name} reacted to own message with ${reaction.emoticon}`;
                systemMessageContentForUser = `${user.name} reacted to own message with ${reaction.emoticon}`;
            } else {
                systemMessageContentForFriend = `${user.name} reacted to ${friend.name}'s message with ${reaction.emoticon}`;
                systemMessageContentForUser = `${user.name} reacted to ${friend.name}'s message with ${reaction.emoticon}`;
            }

            const systemMessageIDForFriend: string = uuidv4();
            const systemMessageForFriend = {
                id: systemMessageIDForFriend,
                content: systemMessageContentForFriend,
                date: new Date(),
                sender: systemMessageIDForFriend,
                read: false,
                reactions: []
            };

            const systemMessageIDForUser: string = uuidv4();
            const systemMessageForUser = {
                id: systemMessageIDForUser,
                content: systemMessageContentForUser,
                date: new Date(),
                sender: systemMessageIDForUser,
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
        } else if (groupID) {
            const participants = await userModel.find({ '_id': { $in: [...participantIDs, yourID] } });

            if (!participants || participants.length === 0) {
                res.status(404).json({ message: "Group participants not found" });
                return;
            }

            for (const participant of participants) {
                const groupInParticipant = participant.groups.find((g: any) => g.id === groupID);
                if (groupInParticipant) {
                    const messagesToUpdate = groupInParticipant.messages.filter((m: any) => m.id === messageID);

                    if (messagesToUpdate.length === 0) {
                        res.status(404).json({ message: `Message not found in participant ${participant._id}'s group messages` });
                        return;
                    }

                    messagesToUpdate.forEach((message: any) => updateReaction(message));

                    const messageSender = messagesToUpdate[0].sender;
                    const messageSenderParticipant = participants.find((p: any) => p.id === messageSender);
                    const messageSenderName = messageSenderParticipant ? messageSenderParticipant.name : 'their own';

                    const systemMessageContent = `${user.name} reacted to ${messageSenderName}'s message with ${reaction.emoticon}`;

                    const systemMessageID: string = uuidv4();
                    const systemMessage = {
                        id: systemMessageID,
                        content: systemMessageContent,
                        date: new Date(),
                        sender: systemMessageID,
                        read: false,
                        reactions: []
                    };

                    groupInParticipant.messages.push(systemMessage);

                    await userModel.findByIdAndUpdate(participant._id, { groups: participant.groups });
                }
            }

            await user.save();

            res.status(200).json({ message: "Reaction added/updated and system messages sent successfully" });
        }
    } catch (error) {
        console.error("Error while adding/updating reaction:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};



// export const addReaction = async (req: Request, res: Response): Promise<void> => {
//     const { yourID, friendID, groupID, messageID, reaction, participants: participantIDs } = req.body;

//     if (!yourID || !messageID || !reaction || (!friendID && !groupID)) {
//         res.status(400).json({ message: "Missing required fields" });
//         return;
//     }

//     try {
//         const user = await userModel.findById(yourID);

//         if (!user) {
//             res.status(404).json({ message: "User not found" });
//             return;
//         }

//         const updateReaction = (message: Message) => {
//             const existingReaction = message.reactions.find(r => r.userID === reaction.userID);
//             if (existingReaction) {
//                 existingReaction.emoticon = reaction.emoticon;
//             } else {
//                 message.reactions.push(reaction);
//             }
//         };

//         if (friendID) {
//             // Friend logic is working fine, keeping it as it is
//         } else if (groupID) {
//             const participants = await userModel.find({ '_id': { $in: [...participantIDs, yourID] } });

//             if (!participants || participants.length === 0) {
//                 res.status(404).json({ message: "Group participants not found" });
//                 return;
//             }

//             const updateOperations = participants.map(async participant => {
//                 const groupInParticipant = participant.groups.find(g => g.id === groupID);
//                 if (groupInParticipant) {
//                     const messagesToUpdate = groupInParticipant.messages.filter(m => m.id === messageID);

//                     if (messagesToUpdate.length === 0) {
//                         console.log(`Message not found in participant ${participant._id}'s group messages`);
//                         res.status(404).json({ message: `Message not found in participant ${participant._id}'s group messages` });
//                         return;
//                     }

//                     messagesToUpdate.forEach(message => updateReaction(message));

//                     await userModel.findByIdAndUpdate(participant._id, { groups: participant.groups });
//                 }
//             });

//             await Promise.all(updateOperations);

//             res.status(200).json({ message: "Reaction added/updated successfully" });
//         }
//     } catch (error) {
//         console.error("Error while adding/updating reaction:", error);
//         res.status(500).json({ message: "Internal server error" });
//     }
// };