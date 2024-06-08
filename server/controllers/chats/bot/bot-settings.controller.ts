import { Request, Response } from "express";
import userModel from "./../../../models/user.model";
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

export const getChatbotSettings = async (req: Request, res: Response): Promise<void> => {
    const { yourID, chatbotID } = req.params;

    if (!yourID || !chatbotID) {
        res.status(400).json({ message: "Both User and Chatbot IDs are required" });
        return;
    } try {
        const user = await userModel.findById(yourID);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const chatbotRelation = user.chatbots.find(chatbot => chatbot.id === chatbotID);
        if (!chatbotRelation) {
            res.status(404).json({ message: "Chatbot not found" });
            return;
        }

        res.json({
            chatbot: {
                id: chatbotRelation.id,
                name: chatbotRelation.name,
                founder: chatbotRelation.founder,
                description: chatbotRelation.description,
                messagesCounter: chatbotRelation.messages.length,
                settings: chatbotRelation.settings,
            },
            messages: chatbotRelation.messages
        });
    } catch (error) {
        res.status(500).send(error);
    }
};

export const setPIN = async (req: Request, res: Response): Promise<void> => {
    const { yourID, chatbotID, PIN } = req.body;

    if (!yourID || !chatbotID) {
        res.status(400).json({ message: "Your ID and Chatbot ID are required" });
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

        const chatbot = user.chatbots.find(f => f.id === chatbotID);
        if (!chatbot) {
            res.status(404).json({ message: "Chatbot not found in user's chatbot list" });
            return;
        }

        chatbot.settings = chatbot.settings || {};
        chatbot.settings.PIN = PIN;

        await user.save();

        res.json({ message: 'PIN set successfully', chatbot });
    } catch (error) {
        console.error('Failed to set PIN:', error);
        res.status(500).json({ message: 'An error occurred', error });
    }
};

export const removePIN = async (req: Request, res: Response): Promise<void> => {
    const { yourID, chatbotID } = req.body;

    if (!yourID || !chatbotID) {
        res.status(400).json({ message: "Your ID and Chatbot ID are required" });
        return;
    } try {

        const user = await userModel.findById(yourID);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        const chatbot = user.chatbots.find(f => f.id === chatbotID);
        if (!chatbot) {
            res.status(404).json({ message: "Chatbot not found in user's chatbot list" });
            return;
        }

        chatbot.settings = chatbot.settings || {};
        chatbot.settings.PIN = 0;

        await user.save();

        res.json({ message: 'PIN removed successfully', chatbot });
    } catch (error) {
        console.error('Failed to remove PIN:', error);
        res.status(500).json({ message: 'An error occurred', error });
    }
};

export const setNickname = async (req: Request, res: Response): Promise<void> => {
    const { yourID, chatbotID, nickname } = req.body;

    if (!yourID || !chatbotID) {
        res.status(400).json({ message: "Your ID and Chatbot ID are required" });
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

        const chatbot = user.chatbots.find(f => f.id === chatbotID);
        if (!chatbot) {
            res.status(404).json({ message: "Chatbot not found in user's chatbot list" });
            return;
        }

        chatbot.settings = chatbot.settings || {};
        chatbot.settings.nickname = nickname;

        await user.save();

        res.json({ message: 'Nickname set successfully', chatbot });
    } catch (error) {
        console.error('Failed to set nickname:', error);
        res.status(500).json({ message: 'An error occurred', error });
    }
};


export const deleteMessages = async (req: Request, res: Response): Promise<void> => {
    const { yourID, chatbotID, password } = req.body;

    if (!yourID || !chatbotID) {
        res.status(400).json({ message: "User ID and Chatbot ID are required" });
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
        const chatbot = user.chatbots.find(bot => bot.id === chatbotID);
        if (!chatbot) {
            res.status(404).json({ message: "Chatbot not found in user's chatbots list" });
            return;
        }
        chatbot.messages = [];
        await user.save();
        res.send({ message: 'All messages deleted successfully' });
    } catch (error) {
        console.error('Failed to delete messages:', error);
        res.status(500).send({ message: 'An error occurred', error });
    }
};
