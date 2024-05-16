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
    }
    try {
        const user = await userModel.findById(yourID);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        // Znalezienie przyjaciela w tablicy 'friends' użytkownika
        const friendRelation = user.friends.find(friend => friend.id === friendID);
        if (!friendRelation) {
            res.status(404).json({ message: "Friend not found" });
            return;
        }

        // Pobieranie dodatkowych danych o przyjacielu z bazy danych
        const friendData = await userModel.findById(friendID).select('name lastname avatar status');
        if (!friendData) {
            res.status(404).json({ message: "Friend data not found" });
            return;
        }

        // Zwrócenie danych przyjaciela wraz z ustawieniami i wiadomościami
        res.json({
            friend: {
                id: friendData._id,
                name: friendData.name,
                lastname: friendData.lastname,
                avatar: friendData.avatar,
                status: friendData.status,
                settings: friendRelation.settings // Dodano ustawienia przyjaciela
            },
            messages: friendRelation.messages // Wiadomości pomiędzy użytkownikami
        });
    } catch (error) {
        res.status(500).send(error);
    }
};

export const getFriend = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;
    if (!id) {
        res.status(400).json({ message: "User and Friend IDs are required" });
        return;
    } try {
        const user = await userModel.findById(id);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.json({
            id: user._id,
            name: user.name,
            lastname: user.lastname,
            avatar: user.avatar,
            status: user.status
        });
    } catch (error) {
        res.status(500).send(error);
    }
}

export const getMessages = async (req: Request, res: Response): Promise<void> => {
    const { yourID, friendID } = req.params;
    if (!yourID || !friendID) {
        res.status(400).json({ message: "User and Friend IDs are required" });
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
            res.status(404).json({ message: "Friend not found" });
            return;
        }
        res.json(friend);
    } catch (error) {
        res.status(500).send(error);
    }
}

export const insertMessages = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;
    const friends: Friend[] = [
        {
            id: "66327712a9539e4158787d3d",
            settings: {
                nickname: "Johnni",
                PIN: 0
            },
            messages: [
                {
                    content: "Hi mate!",
                    date: "12:15",
                    sender: "Self"
                },
                {
                    content: "Hello my friend!",
                    date: "12:17",
                    sender: "Other"
                },
                {
                    content: "What's up?",
                    date: "12:20",
                    sender: "Self"
                }
            ]
        },
        {
            id: "66327724a9539e4158787d40",
            settings: {
                nickname: "Dawn",
                PIN: 0
            },
            messages: [
                {
                    content: "Hello!",
                    date: "12:12",
                    sender: "Self"
                },
                {
                    content: "Hi!",
                    date: "12:13",
                    sender: "Other"
                },
                {
                    content: "How are you?",
                    date: "12:14",
                    sender: "Self"
                }
            ]
        },

    ]
    const friend: Friend = {
        id: "66327712a9539e4158787d3d",
        settings: {
            nickname: "Johnni",
            PIN: 0
        },
        messages: [
            {
                content: "Hi mate!",
                date: "12:15",
                sender: "Self"
            },
            {
                content: "Hello my friend!",
                date: "12:17",
                sender: "Other"
            },
            {
                content: "What's up?",
                date: "12:20",
                sender: "Self"
            }
        ]
    }
    if (!id) return;
    try {
        const user = await userModel.findById(id);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        user.friends.push(...friends);
        await user.save();
        res.send('Friends added successfully');
    } catch (error) {
        res.status(500).send(error);
    }
};
