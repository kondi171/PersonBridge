import { Request, Response } from "express";
import userModel from "../models/users.model";
import { Friend } from "../typescript/interfaces";

// Przyda się podczas implementacji chatSettings
// export const getUserMessages = async (req: Request, res: Response): Promise<void> => {
//     const userId = req.params.id;
//     if (!userId) {
//         res.status(400).json({ message: "User ID is required" });
//         return;
//     }
//     try {
//         const user = await userModel.findById(userId);
//         if (!user) {
//             res.status(404).json({ message: "User not found." });
//             return;
//         }

//         const friendsData: any[] = user.friends.map(friend => friend); // Załóżmy, że friends jest już poprawnie typowany w Twoim modelu
//         const friendsIDs = user.friends.map(friend => friend.id); // Zbierz ID przyjaciół

//         if (friendsData.length === 0) {
//             res.status(200).json([]);
//             return;
//         }

//         // Znajdź wszystkich przyjaciół w bazie danych
//         const friends = await userModel.find({
//             '_id': { $in: friendsIDs }
//         }).select('name lastname avatar status'); // Pobierz tylko potrzebne informacje

//         // Przypisz dodatkowe dane do wyników wyszukiwania
//         const results = friends.map(friend => {
//             const friendData = friendsData.find(f => f.id === friend._id.toString());
//             return {
//                 id: friend._id,
//                 name: friend.name,
//                 lastname: friend.lastname,
//                 avatar: friend.avatar,
//                 status: friend.status,
//                 settings: friendData ? friendData.settings : {},
//                 messages: friendData ? friendData.messages : []
//             };
//         });
//         console.log(results)
//         res.json(results);
//     } catch (error) {
//         res.status(500).send(error);
//     }
// };
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
        const friendData = await userModel.findById(friendID).select('name lastname avatar status');
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
                settings: friendRelation.settings
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
        const newMessage = {
            content: message,
            date: new Date(),
            sender: 'Self'
        };
        friend.messages.push(newMessage);
        await user.save();
        const friendDocument = await userModel.findById(friendID);
        if (friendDocument) {
            const userInFriend = friendDocument.friends.find(f => f.id === yourID);
            if (userInFriend) {
                const messageForFriend = {
                    content: message,
                    date: new Date(),
                    sender: 'Other'
                };
                userInFriend.messages.push(messageForFriend);
                await friendDocument.save();
            }
        }
        res.status(200).json({ message: "Message sent successfully" });
    } catch (error) {
        console.error("Error sending message: ", error);
        res.status(500).json({ message: "Error sending message" });
    }
};

