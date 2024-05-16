import { Request, Response } from "express";
import userModel from "../models/users.model";
import { UserStatus } from "../typescript/enums";

export const getOnline = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;
    if (!id) {
        res.status(400).json({ message: "Invalid or missing user ID." });
        return;
    }
    try {
        const user = await userModel.findById(id);
        if (!user) {
            res.status(404).json({ message: "User not found." });
            return;
        }

        const friendsIds = user.friends.map(friend => friend.id);
        const blockedIds = user.blocked;

        if (friendsIds.length === 0 && blockedIds.length === 0) {
            res.status(200).json([]);
            return;
        }
        const onlineFriends = await userModel.find({
            '_id': { $in: friendsIds, $nin: blockedIds },
            'status': UserStatus.ONLINE
        }).select('name lastname avatar mail');
        const response = onlineFriends.map(friend => ({
            id: friend._id,
            name: friend.name,
            lastname: friend.lastname,
            mail: friend.mail,
            avatar: friend.avatar
        }));

        res.status(200).json(response);
    } catch (error) {
        console.error('Error retrieving online friends:', error);
        res.status(500).json({ message: "An error occurred while retrieving online friends.", error: error });
    }
};


export const getOffline = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;
    if (!id) {
        res.status(400).json({ message: "Invalid or missing user ID." });
        return;
    }
    try {
        const user = await userModel.findById(id);
        if (!user) {
            res.status(404).json({ message: "User not found." });
            return;
        }

        const friendsIds = user.friends.map(friend => friend.id);
        const blockedIds = user.blocked;

        if (friendsIds.length === 0 && blockedIds.length === 0) {
            res.status(200).json([]);
            return;
        }
        const offlineFriends = await userModel.find({
            '_id': { $in: friendsIds, $nin: blockedIds },
            'status': UserStatus.OFFLINE
        }).select('name lastname avatar mail');
        const response = offlineFriends.map(friend => ({
            id: friend._id,
            name: friend.name,
            lastname: friend.lastname,
            mail: friend.mail,
            avatar: friend.avatar
        }));

        res.status(200).json(response);
    } catch (error) {
        console.error('Error retrieving offline friends:', error);
        res.status(500).json({ message: "An error occurred while retrieving offline friends.", error: error });
    }
};

export const getBlocked = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;
    if (!id) {
        res.status(400).json({ message: "Invalid or missing user ID." });
        return;
    } try {
        const user = await userModel.findById(id, 'blocked');
        if (!user) {
            res.status(404).json({ message: "User not found." });
            return;
        }
        if (user.blocked.length === 0) {
            res.status(200).json([]);
            return;
        }
        const blockedUsers = await userModel.find({
            '_id': { $in: user.blocked }
        },
            'name lastname mail avatar'
        );

        res.json(blockedUsers.map(blocked => ({
            id: blocked._id,
            name: blocked.name,
            lastname: blocked.lastname,
            mail: blocked.mail,
            avatar: blocked.avatar
        })));
    } catch (error) {
        console.error('Error retrieving blocked users:', error);
        res.status(500).json({ message: "An error occurred while retrieving blocked users.", error: error });
    }
};
export const unblock = async (req: Request, res: Response): Promise<void> => {
    const { yourID, friendID } = req.body;
    if (!yourID || !friendID) {
        res.status(400).json({ message: "Invalid or missing user ID" });
        return;
    } try {
        const updatedUser = await userModel.findByIdAndUpdate(
            yourID,
            { $pull: { blocked: friendID } },
            { new: true }
        );
        if (!updatedUser) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json({ message: "User has been successfully unblocked." });
    } catch (error) {
        console.error('Error during the unblock operation:', error);
        res.status(500).json({ message: "An error occurred while unblocking the user.", error: error });
    }
};


export const getRequests = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;
    if (!id) {
        res.status(400).json({ message: "Invalid or missing user ID." });
        return;
    } try {
        const user = await userModel.findById(id, 'requests.received');
        if (!user || !user.requests || !user.requests.received) {
            res.status(404).json({ message: "User not found or no received requests." });
            return;
        }
        const receivedRequests = await userModel.find({
            '_id': { $in: user.requests.received }
        }, 'name lastname mail avatar').lean();

        res.json(receivedRequests.map(request => ({
            id: request._id,
            name: request.name,
            lastname: request.lastname,
            mail: request.mail,
            avatar: request.avatar
        })));
    } catch (error) {
        console.error('Error retrieving user requests:', error);
        res.status(500).json({ message: 'Failed to retrieve user requests.' });
    }
};

export const acceptRequest = async (req: Request, res: Response): Promise<void> => {
    const { yourID, friendID, yourName, friendName } = req.body;
    if (!yourID || !friendID || !yourName || !friendName) {
        res.status(400).json({ message: "Invalid or missing user ID or name." });
        return;
    } try {
        const updatedUser = await userModel.findByIdAndUpdate(
            yourID,
            {
                $addToSet: {
                    friends: {
                        id: friendID,
                        settings: {
                            nickname: yourName,
                        },
                        messages: []
                    }
                },
                $pull: { "requests.received": friendID }
            },
            { new: true, multi: true }
        );
        const updatedFriend = await userModel.findByIdAndUpdate(
            friendID,
            {
                $addToSet: {
                    friends: {
                        id: yourID,
                        settings: {
                            nickname: yourName,
                        },
                        messages: []
                    }
                },
                $pull: { "requests.sent": yourID, "requests.received": yourID },
            },
            { new: true, multi: true }
        );
        if (!updatedUser || !updatedFriend) {
            res.status(404).json({ message: "User not found." });
            return;
        }
        res.status(200).json({ message: "Friend request accepted!" });
    } catch (error) {
        res.status(500).json({ message: "An error occurred while updating user data.", error: error });
    }
};

export const ignoreRequest = async (req: Request, res: Response): Promise<void> => {
    const { yourID, friendID } = req.body;
    if (!yourID || !friendID) {
        res.status(400).json({ message: "Invalid or missing user ID." });
        return;
    } try {
        const updatedUser = await userModel.findByIdAndUpdate(
            yourID,
            { $pull: { "requests.received": friendID } },
            { new: true }
        );
        const updatedFriend = await userModel.findByIdAndUpdate(
            friendID,
            { $pull: { "requests.sent": yourID } },
            { new: true }
        )
        if (!updatedUser || !updatedFriend) {
            res.status(404).json({ message: "User not found." });
            return;
        }
        res.status(200).json({ message: "Friend request ignored." });
    } catch (error) {
        console.error('Error during the ignoring request operation:', error);
        res.status(500).json({ message: "An error occurred while updating user data.", error: error });
    }
};

