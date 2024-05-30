import { Request, Response } from "express";
import userModel from "./../../../models/user.model";
import bcrypt from 'bcrypt';
import { promises as fsPromises } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { getIo } from "./../../../middlewares/websocket.middleware";
import { UserStatus } from "../../../typescript/enums";

export const getGroupSettings = async (req: Request, res: Response): Promise<void> => {
    try {
        const { yourID, groupID } = req.params;
        if (!yourID || !groupID) {
            res.status(400).json({ message: "Both User and Group IDs are required" });
            return;
        }
        const user = await userModel.findById(yourID).populate('groups').exec();
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const group = user.groups.find((group: any) => group.id.toString() === groupID);
        if (!group) {
            res.status(404).json({ message: "Group not found" });
            return;
        }
        const administrator = await userModel.findById(group.administrator, 'name lastname avatar');
        if (!administrator) {
            res.status(404).json({ message: "Administrator not found" });
            return;
        }
        const participants = await Promise.all(group.participants.map(async (participantID: string) => {
            const participant = await userModel.findById(participantID, 'name lastname avatar mail');
            return participant;
        }));
        const response = {
            id: group.id,
            name: group.name,
            administrator: {
                id: administrator.id,
                name: administrator.name,
                lastname: administrator.lastname,
                avatar: administrator.avatar
            },
            avatar: group.avatar,
            participants: participants.map(participant => ({
                id: participant?.id,
                name: participant?.name,
                lastname: participant?.lastname,
                avatar: participant?.avatar,
                mail: participant?.mail
            })),
            accessibility: group.accessibility,
            messages: group.messages
        };

        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

export const uploadAvatar = async (req: Request, res: Response): Promise<void> => {
    if (req.file && req.params.id) {
        const groupID = req.params.id;
        const filePath = `resources/groups/avatars/${req.file.filename}`;
        const avatarDirectory = path.join(__dirname, '../../../', 'resources/groups/avatars');
        const newAvatarPath = path.join(avatarDirectory, req.file.filename);
        try {
            const files = await fsPromises.readdir(avatarDirectory);
            const oldAvatars = files.filter(file => file.includes(groupID) && path.join(avatarDirectory, file) !== newAvatarPath);
            for (const file of oldAvatars) {
                await fsPromises.unlink(path.join(avatarDirectory, file));
            }
            await userModel.updateMany(
                { "groups.id": groupID },
                { $set: { "groups.$.avatar": filePath } }
            );
            res.send({ message: 'The group avatar has been successfully changed', file: filePath })
        } catch (error) {
            console.error('Error updating user avatar:', error);
            res.status(500).json({ message: 'Failed to update group avatar.' });
        }
    } else {
        res.status(400).json({ message: 'No file uploaded.' });
    }
};

export const notifyAvatarChange = async (req: Request, res: Response): Promise<void> => {
    const { yourID, groupID } = req.body;
    if (!yourID || !groupID) {
        res.status(400).json({ message: "Your ID and Group ID are required" });
        return;
    } try {
        const participants = await userModel.find({ 'groups.id': groupID });

        if (!participants || participants.length === 0) {
            res.status(404).json({ message: "Group participants not found" });
            return;
        }
        const systemMessageID: string = uuidv4();
        const systemMessage = {
            id: systemMessageID,
            content: `The group avatar has been changed`,
            date: new Date(),
            sender: systemMessageID,
            read: false,
            reactions: []
        };

        for (const participant of participants) {
            const group = participant.groups.find(g => g.id === groupID);
            if (group) {
                group.messages.push(systemMessage);
                await participant.save();
            }
        }

        const participantIDs = participants.map(p => p._id.toString());
        const io = getIo();
        io.to(participantIDs).emit('groupAvatarChanged', { groupID });

        res.status(200).json({ message: 'Group avatar updated and system messages sent successfully.' });

    } catch (error) {
        console.error('Error sending avatar change notification:', error);
        res.status(500).json({ message: 'Failed to send avatar change notification.' });
    }
};

export const setMute = async (req: Request, res: Response): Promise<void> => {
    const { yourID, groupID } = req.body;
    if (!yourID || !groupID) {
        res.status(400).json({ message: "Both User ID and Group ID are required" });
        return;
    } try {
        const user = await userModel.findById(yourID);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const group = user.groups.find((group) => group.id === groupID);
        if (!group) {
            res.status(404).json({ message: "Group not found" });
            return;
        }
        group.accessibility.mute = !group.accessibility.mute;
        await user.save();
        res.status(200).json({ mute: group.accessibility.mute });
    } catch (error) {
        res.status(500).send(error);
    }
};

export const setIgnore = async (req: Request, res: Response): Promise<void> => {
    const { yourID, groupID } = req.body;
    if (!yourID || !groupID) {
        res.status(400).json({ message: "Both User ID and Group ID are required" });
        return;
    } try {
        const user = await userModel.findById(yourID);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const group = user.groups.find((group) => group.id === groupID);
        if (!group) {
            res.status(404).json({ message: "Group not found" });
            return;
        }
        group.accessibility.ignore = !group.accessibility.ignore;
        await user.save();
        res.status(200).json({ ignore: group.accessibility.ignore });
    } catch (error) {
        res.status(500).send(error);
    }
};

export const editGroupName = async (req: Request, res: Response): Promise<void> => {
    const { yourID, groupID, participants, name, password } = req.body;

    if (!yourID) {
        res.status(400).send({ error: 'Your ID is required!' });
        return;
    }
    if (!groupID) {
        res.status(400).send({ error: 'Group ID is required!' });
        return;
    }
    if (!name) {
        res.status(400).send({ error: 'Name is required!' });
        return;
    }
    if (!password) {
        res.status(400).send({ error: 'Password is required!' });
        return;
    }
    if (!participants || !Array.isArray(participants) || participants.length === 0) {
        res.status(400).send({ error: 'Participants are required!' });
        return;
    } try {
        const user = await userModel.findById(yourID);
        if (!user) {
            res.status(404).send({ error: 'User not found!' });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(400).send({ error: 'Invalid password!' });
            return;
        }

        const group = user.groups.find(group => group.id === groupID);
        if (!group) {
            res.status(404).send({ error: 'Group not found in user\'s groups!' });
            return;
        }

        if (group.name === name) {
            res.status(200).send({ message: 'Group name is already the desired name. No update needed.' });
            return;
        }

        const oldName = group.name;
        group.name = name;

        const systemMessageContent = `${user.name} changed the group name from ${oldName} to ${name}`;
        const systemMessageID: string = uuidv4();
        const systemMessage = {
            id: systemMessageID,
            content: systemMessageContent,
            date: new Date(),
            sender: systemMessageID,
            read: false,
            reactions: []
        };

        group.messages.push(systemMessage);

        await user.save();

        const participantIDs = participants.map(participant => participant.id);

        const participantUpdates = participantIDs.map(async participantID => {
            const participant = await userModel.findById(participantID);
            if (participant) {
                const groupInParticipant = participant.groups.find(g => g.id === groupID);
                if (groupInParticipant) {
                    if (groupInParticipant.name !== name) {
                        groupInParticipant.name = name;
                        groupInParticipant.messages.push(systemMessage);
                        await participant.save();
                    }
                }
            }
        });

        await Promise.all(participantUpdates);

        const io = getIo();
        io.to(participantIDs).emit('groupNameChanged', { from: yourID, groupID, newName: name });

        res.status(200).send({ message: 'Group name updated successfully and system messages sent!' });
    } catch (error) {
        console.error("Error updating group name:", error);
        res.status(500).send({ error: 'Internal server error' });
    }
};


export const addParticipants = async (req: Request, res: Response): Promise<void> => {
    const { yourID, groupID, participants } = req.body;

    if (!yourID || !groupID || !participants || !Array.isArray(participants) || participants.length < 1) {
        res.status(400).json({ message: "User ID, Group ID, and at least one Participant ID are required" });
        return;
    } try {
        const user = await userModel.findById(yourID);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        const group = user.groups.find((group: any) => group.id.toString() === groupID);
        if (!group) {
            res.status(404).json({ message: "Group not found" });
            return;
        }

        if (group.administrator.toString() !== yourID) {
            res.status(403).json({ message: "You need to be administrator of this group to add participants" });
            return;
        }

        const participantIDs = Array.from(new Set([yourID, ...group.participants.map((p: any) => p.toString()), ...participants]));

        for (const participantID of participantIDs) {
            const participant = await userModel.findById(participantID);
            if (participant) {
                let groupInParticipant = participant.groups.find((g: any) => g.id.toString() === groupID);
                if (!groupInParticipant) {
                    participant.groups.push({
                        id: groupID,
                        name: group.name,
                        avatar: group.avatar,
                        administrator: group.administrator,
                        status: UserStatus.OFFLINE,
                        participants: participantIDs,
                        messages: group.messages,
                        accessibility: group.accessibility
                    });
                } else {
                    groupInParticipant.participants = participantIDs;
                }
                await participant.save();
            }
        }
        await userModel.findOneAndUpdate(
            { _id: yourID, 'groups.id': groupID },
            { $addToSet: { 'groups.$.participants': { $each: participants } } },
            { new: true }
        );
        const systemMessageID: string = uuidv4();
        const systemMessage = {
            id: systemMessageID,
            content: `New participants have been added to the group`,
            date: new Date(),
            sender: systemMessageID,
            read: false,
            reactions: []
        };

        for (const participantID of participantIDs) {
            await userModel.findOneAndUpdate(
                { _id: participantID, 'groups.id': groupID },
                { $push: { 'groups.$.messages': systemMessage } },
                { new: true }
            );
        }

        const io = getIo();
        io.to(participantIDs).emit('groupUpdated', { groupID });

        res.status(200).json({ message: 'Participants added to the group successfully' });
    } catch (error) {
        console.error("Error adding participants to group:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const removeParticipant = async (req: Request, res: Response): Promise<void> => {
    const { yourID, groupID, removeID, participants } = req.body;

    if (!yourID || !groupID || !removeID) {
        res.status(400).json({ message: "User ID, Group ID, and Participant ID to remove are required" });
        return;
    } try {
        const adminUser = await userModel.findById(yourID);
        if (!adminUser) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        const adminGroup = adminUser.groups.find((group: any) => group.id.toString() === groupID);
        if (!adminGroup) {
            res.status(404).json({ message: "Group not found" });
            return;
        }

        if (adminGroup.administrator.toString() !== yourID) {
            res.status(403).json({ message: "You need to be administrator of this group to remove a participant" });
            return;
        }

        const io = getIo();
        io.to(removeID).emit('groupUpdated', { groupID });

        const participantIDs = participants.map((participant: any) => participant.id);
        for (const participantID of participantIDs) {
            const participant = await userModel.findById(participantID);
            if (participant) {
                const groupInParticipant = participant.groups.find((g: any) => g.id.toString() === groupID);
                if (groupInParticipant) {
                    groupInParticipant.participants = groupInParticipant.participants.filter((id: string) => id.toString() !== removeID);
                    await participant.save();
                }
            }
        }

        const removedParticipant = await userModel.findById(removeID);
        if (removedParticipant) {
            removedParticipant.groups = removedParticipant.groups.filter((group: any) => group.id.toString() !== groupID);
            await removedParticipant.save();
        }
        const systemMessageID: string = uuidv4();
        const systemMessage = {
            id: systemMessageID,
            content: `${removedParticipant?.name} has been removed from the group`,
            date: new Date(),
            sender: systemMessageID,
            read: false,
            reactions: []
        };

        for (const participantID of participantIDs) {
            const participant = await userModel.findById(participantID);
            if (participant) {
                const groupInParticipant = participant.groups.find((g: any) => g.id.toString() === groupID);
                if (groupInParticipant) {
                    groupInParticipant.messages.push(systemMessage);
                    await participant.save();
                }
            }
        }

        io.to(participantIDs).emit('groupUpdated', { groupID });

        res.status(200).json({ message: 'Participant removed from the group successfully' });
    } catch (error) {
        console.error("Error removing participant from group:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteAllGroupMessages = async (req: Request, res: Response): Promise<void> => {
    const { yourID, groupID, password } = req.body;
    if (!yourID || !groupID) {
        res.status(400).json({ message: "Both User ID and Group ID are required" });
        return;
    }

    if (!password) {
        res.status(400).json({ message: "Password is required" });
        return;
    }

    try {
        const user = await userModel.findById(yourID);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ message: "Invalid password" });
            return;
        }

        const group = user.groups.find((group: any) => group.id === groupID);
        if (!group) {
            res.status(404).json({ message: "Group not found" });
            return;
        }

        group.messages = [];

        await user.save();

        res.status(200).json({ message: "All group messages deleted successfully" });
    } catch (error) {
        console.error("Error deleting group messages:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const leaveGroup = async (req: Request, res: Response): Promise<void> => {
    const { yourID, groupID, password } = req.body;

    if (!yourID || !groupID) {
        res.status(400).json({ message: "Both User ID and Group ID are required" });
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

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ message: "Invalid password" });
            return;
        }

        const group = user.groups.find((group: any) => group.id.toString() === groupID);
        if (!group) {
            res.status(404).json({ message: "Group not found" });
            return;
        }

        let newAdmin = null;

        if (group.administrator.toString() === yourID) {
            newAdmin = group.participants.find((participantID: string) => participantID.toString() !== yourID);
            if (newAdmin) {
                group.administrator = newAdmin;
            } else {
                group.administrator = '';
            }
        }

        user.groups = user.groups.filter((group: any) => group.id.toString() !== groupID);
        await user.save();

        const systemMessageID: string = uuidv4();
        const systemMessage = {
            id: systemMessageID,
            content: `${user.name} ${user.lastname} has left the group`,
            date: new Date(),
            sender: systemMessageID,
            read: false,
            reactions: []
        };

        const participants = await userModel.find({ 'groups.id': groupID });
        for (const participant of participants) {
            const groupInParticipant = participant.groups.find((g: any) => g.id.toString() === groupID);
            if (groupInParticipant) {
                if (groupInParticipant.administrator.toString() === yourID) {
                    groupInParticipant.administrator = newAdmin || '';
                }
                groupInParticipant.participants = groupInParticipant.participants.filter((participantID: string) => participantID.toString() !== yourID);
                groupInParticipant.messages.push(systemMessage);
                await participant.save();
            }
        }

        const participantIDs = participants.map(p => p._id.toString());
        const io = getIo();
        io.to([...participantIDs, yourID]).emit('groupUpdated', { groupID });

        res.status(200).json({ message: 'You have left the group successfully' });
    } catch (error) {
        console.error("Error leaving group:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};