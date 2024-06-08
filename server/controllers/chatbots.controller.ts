import { Request, Response } from "express";
import axios from 'axios';
import userModel from "../models/user.model";
import chatbotModel from "../models/chatbot.model";
import { v4 as uuidv4 } from 'uuid';
import { Chatbot } from "../typescript/interfaces";
import { HfInference } from '@huggingface/inference';
import OpenAI from "openai";

export const getChatbots = async (req: Request, res: Response): Promise<void> => {
    try {
        const chatbots = await chatbotModel.find({});
        if (!chatbots) {
            res.status(400).json({ error: 'No Chatbot found!' });
            return;
        }
        res.send({ chatbots: chatbots });
    } catch (error) {
        res.status(500).send(error);
    }
}

export const addChatbotToUser = async (req: Request, res: Response): Promise<void> => {
    const { yourID, chatbotID } = req.body;
    if (!yourID || !chatbotID) {
        res.status(400).json({ error: 'yourID and chatbotID are required' });
        return;
    }
    try {
        const user = await userModel.findById(yourID);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const existingChatbot = user.chatbots.find((bot: Chatbot) => bot.id === chatbotID);
        if (existingChatbot) {
            res.send({ message: 'Chatbot already exist!' });
            return;
        }

        const chatbot = await chatbotModel.findById(chatbotID);
        if (!chatbot) {
            res.status(404).json({ error: 'Chatbot not found' });
            return;
        }

        const chatbotToAdd = {
            id: chatbotID,
            name: chatbot.name,
            founder: chatbot.founder,
            description: chatbot.description,
            modelAPI: chatbot.modelAPI,
            settings: {
                nickname: chatbot.name,
                PIN: 0
            },
            messages: []
        };

        user.chatbots.push(chatbotToAdd);
        await user.save();

        res.status(200).json({ message: 'Chatbot added successfully', chatbot: chatbotToAdd });
    } catch (error) {
        console.error('Error communicating with chatbot:', error);
        res.status(500).json({ error: 'Failed to get response from chatbot' });
    }
};

export const addChatbotToCollection = async (req: Request, res: Response): Promise<void> => {
    // const { id, name, avatar, modelAPI, settings, messages } = req.body;

    // if (!id || !name || !modelAPI) {
    //     res.status(400).json({ error: 'id, name, and modelAPI are required' });
    //     return;
    // }

    try {
        const newChatbot = new chatbotModel({
            name: 'DistilBERT',
            founder: 'Hugging Face',
            description: 'A lighter and faster version of BERT, while retaining much of its accuracy.',
            modelAPI: 'https://api-inference.huggingface.co/models/distilbert-base-uncased'
        });

        await newChatbot.save();

        res.status(201).json({ message: 'Chatbot added successfully', chatbot: newChatbot });
    } catch (error) {
        console.error('Error adding chatbot:', error);
        res.status(500).json({ error: 'Failed to add chatbot' });
    }
};