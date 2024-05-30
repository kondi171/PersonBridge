import { Request, Response } from "express";
import userModel from "./../../../models/user.model";
import { UserStatus } from "./../../../typescript/enums";
import { v4 as uuidv4 } from 'uuid';
import { getIo } from "./../../../middlewares/websocket.middleware";

export const getGroupChat = async (req: Request, res: Response): Promise<void> => {
    const { yourID, groupID } = req.params;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const offset = parseInt(req.query.offset as string, 10) || 0;
    if (!yourID || !groupID) {
        res.status(400).json({ message: "Both User and Group IDs are required" });
        return;
    } try {
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
        const filteredParticipants = groupRelation.participants.filter((participant: string) => participant !== yourID);
        const participantIDs = filteredParticipants.map((participant: string) => participant);

        const groupParticipants = await userModel.find({ _id: { $in: participantIDs } }, 'status avatar name');

        let groupStatus = UserStatus.OFFLINE;
        if (groupParticipants.some((participant: any) => participant.status === UserStatus.ONLINE)) {
            groupStatus = UserStatus.ONLINE;
        }

        const participants = groupParticipants.map((participant: any) => ({
            id: participant._id,
            status: participant.status,
            avatar: participant.avatar,
            nickname: participant.name
        }));

        const totalMessages = groupRelation.messages.length;
        const end = totalMessages - offset;
        const start = Math.max(0, end - limit);
        const messages = groupRelation.messages.slice(start, end);

        const response = {
            id: groupRelation.id,
            name: groupRelation.name,
            avatar: groupRelation.avatar,
            status: groupStatus,
            administrator: groupRelation.administrator,
            participants: participants,
            messages: messages
        }
        res.json(response);
    } catch (error) {
        res.status(500).send(error);
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
                if (groupInParticipant && !groupInParticipant.accessibility.ignore) {
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
                    const io = getIo();
                    io.to(participant.id.toString()).emit('messageToGroupSent', { from: yourID, groupID });
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

export const addGroupReaction = async (req: Request, res: Response): Promise<void> => {
    const { yourID, groupID, messageID, reaction, participants: participantIDs } = req.body;
    if (!yourID || !groupID || !messageID || !reaction || !participantIDs) {
        res.status(400).json({ message: "Missing required fields" });
        return;
    } try {
        const user = await userModel.findById(yourID);

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        const participants = await userModel.find({ '_id': { $in: [...participantIDs, yourID] } });

        if (!participants || participants.length === 0) {
            res.status(404).json({ message: "Group participants not found" });
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

        const io = getIo();
        io.to(participantIDs).emit('addReactionToGroup', { from: yourID });

        res.status(200).json({ message: "Reaction added/updated and system messages sent successfully" });
    } catch (error) {
        console.error("Error while adding/updating reaction:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const markGroupMessagesAsRead = async (req: Request, res: Response): Promise<void> => {
    const { yourID, groupID } = req.body;
    if (!yourID || !groupID) {
        res.status(400).json({ message: "User ID and Group ID are required" });
        return;
    } try {
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
        group.messages.forEach(message => {
            message.read = true;
        });

        await user.save();

        res.status(200).json({ message: "All messages marked as read" });
    } catch (error) {
        console.error("Error marking messages as read", error);
        res.status(500).json({ message: "Internal server error" });
    }
};