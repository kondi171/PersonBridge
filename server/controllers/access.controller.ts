import { Request, Response } from "express";
import userModel from "../models/user.model";
import { ChatType } from "../typescript/enums";
import { v4 as uuidv4 } from 'uuid';
import { promises as fsPromises } from 'fs';
import path from 'path';
import { getIo } from "../middlewares/websocket.middleware";

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

export const getUserStatus = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;
    if (!id) return;
    try {
        const user = await userModel.findOne({ _id: id });
        if (user) res.send({ status: user.status });
    } catch (error) {
        res.status(500).send(error);
    }
};

export const changeUserStatus = async (req: Request, res: Response): Promise<void> => {
    const { yourID, status } = req.body;
    if (!yourID || !status) {
        res.status(400).send("Missing parameters");
        return;
    } try {
        const user = await userModel.findById(yourID);
        if (user) {
            user.status = status;
            const io = getIo();

            user.friends.forEach(friend => io.to(friend.id.toString()).emit('statusChange', { from: yourID, status }));

            await user.save();
            res.send({ status: user.status });
        } else {
            res.status(404).send("User not found");
        }
    } catch (error) {
        console.error("Error updating user status:", error);
        res.status(500).send("Internal server error");
    }
};

export const getUserFriendsAndGroupsWithMessages = async (req: Request, res: Response): Promise<void> => {
    const userID = req.params.id;
    if (!userID) {
        res.status(400).json({ message: "User ID is required" });
        return;
    } try {
        const user = await userModel.findById(userID);
        if (!user) {
            res.status(404).json({ message: "User not found." });
            return;
        }

        const friendsData = user.friends;
        const friendsIDs = friendsData.map(friend => friend.id);
        const groupsData = user.groups;

        const friends = await userModel.find({
            '_id': { $in: friendsIDs }
        });

        const friendsResults = friends
            .map(friend => {
                const friendData = friendsData.find(f => f.id === friend._id.toString());
                if (!friendData || friendData.messages.length === 0) {
                    return null;
                }

                const lastMessage = friendData.messages.slice(-1)[0];

                return {
                    id: friend._id,
                    name: friend.name,
                    lastname: friend.lastname,
                    avatar: friend.avatar,
                    status: friend.status,
                    lastMessage: lastMessage,
                    settings: friendData.settings,
                    accessibility: friendData.accessibility,
                    type: ChatType.USER_CHAT
                };
            })
            .filter(result => result !== null);

        const groupsResults = await Promise.all(groupsData.map(async group => {
            if (group.messages.length === 0) {
                return null;
            }

            const participantsStatus = await Promise.all(group.participants.map(async participantID => {
                const participant = await userModel.findById(participantID);
                return participant ? { id: participant._id, status: participant.status, name: participant.name } : null;
            }));

            const lastMessage = group.messages.slice(-1)[0];
            return {
                id: group.id,
                name: group.name,
                avatar: group.avatar,
                participants: participantsStatus.filter(p => p !== null),
                accessibility: group.accessibility,
                lastMessage: lastMessage,
                type: ChatType.GROUP_CHAT
            };
        }));

        res.json({ friends: friendsResults, groups: groupsResults.filter(result => result !== null) });
    } catch (error) {
        res.status(500).send(error);
    }
};

export const getFriends = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;
    if (!id) {
        res.status(400).json({ message: "Invalid or missing user ID." });
        return;
    } try {
        const user = await userModel.findById(id);
        if (!user) {
            res.status(404).json({ message: "User not found." });
            return;
        }

        const friendsIds = user.friends.map(friend => friend.id);
        const blockedIds = user.blocked;

        if (friendsIds.length === 0) {
            res.status(200).json([]);
            return;
        }

        const friends = await userModel.find({
            '_id': { $in: friendsIds, $nin: blockedIds }
        }).select('name lastname avatar mail');

        const response = friends.map(friend => ({
            id: friend._id,
            name: friend.name,
            lastname: friend.lastname,
            mail: friend.mail,
            avatar: friend.avatar
        }));

        res.status(200).json(response);
    } catch (error) {
        console.error('Error retrieving friends:', error);
        res.status(500).json({ message: "An error occurred while retrieving friends.", error: error });
    }
};

export const createGroup = async (req: Request, res: Response): Promise<void> => {
    const { name, participants } = req.body;
    let avatar = req.body.avatar;
    if (!name || participants.length < 3) {
        res.status(400).json({ message: "Missing parameters!" });
        return;
    }
    if (!avatar) avatar = 'resources/groups/avatars/Blank-Avatar.jpg';
    const creatorID = participants[0];

    try {
        const newGroup = {
            id: uuidv4(),
            name: name,
            participants: participants,
            avatar: avatar,
            administrator: creatorID
        }

        await userModel.updateMany(
            { _id: { $in: participants } },
            { $push: { groups: newGroup } }
        );

        res.send(newGroup);
    } catch (error) {
        console.error('Creating Group failed:', error);
        res.status(500).json({ message: 'An error occurred while creating the group', error });
    }
};

export const uploadAvatar = async (req: Request, res: Response): Promise<void> => {
    if (req.file && req.params.id) {

        const groupID = req.params.id;
        const filePath = `resources/groups/avatars/${req.file.filename}`;
        const avatarDirectory = path.join(__dirname, '..', 'resources/groups/avatars');
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
        } catch (error) {
            console.error('Error updating group avatar:', error);
            res.status(500).json({ message: 'Failed to update group avatar.' });
        }
    } else {
        res.status(400).json({ message: 'No file uploaded.' });
    }
};
