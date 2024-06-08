import { Request, Response } from "express";
import axios from 'axios';
import userModel from "../../../models/user.model";
import chatbotModel from "../../../models/chatbot.model";
import { v4 as uuidv4 } from 'uuid';
import { Chatbot } from "../../../typescript/interfaces";
import { HfInference } from '@huggingface/inference';
import OpenAI from "openai";

export const getChatbot = async (req: Request, res: Response): Promise<void> => {
    const { yourID, chatbotID } = req.params;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const offset = parseInt(req.query.offset as string, 10) || 0;
    if (!yourID || !chatbotID) {
        res.status(400).json({ error: 'Both yourID and chatbotID are required' });
        return;
    }

    try {
        const user = await userModel.findOne({ _id: yourID });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const chatbot = user.chatbots.find(bot => bot.id === chatbotID);
        if (!chatbot) {
            res.status(404).json({ error: 'Chatbot not found' });
            return;
        }

        const totalMessages = chatbot.messages.length;
        const end = totalMessages - offset;
        const start = Math.max(0, end - limit);
        const messages = chatbot.messages.slice(start, end);
        res.send({
            chatbot: {
                id: chatbot.id,
                name: chatbot.name,
                founder: chatbot.founder,
                description: chatbot.description,
                settings: chatbot.settings,
                modelAPI: chatbot.modelAPI,
            },
            messages: messages
        });
    } catch (error) {
        res.status(500).send(error);
    }
};
export const sendMessageToChatbot = async (req: Request, res: Response): Promise<void> => {
    const { yourID, chatbotID, message } = req.body;
    if (!yourID || !chatbotID || !message) {
        res.status(400).json({ error: 'Message, yourID and chatbotID are required' });
        return;
    }

    try {
        const user = await userModel.findById(yourID);

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const chatbot = user.chatbots.find(bot => bot.id === chatbotID);

        if (!chatbot) {
            res.status(404).json({ error: 'Chatbot not found' });
            return;
        }

        const messageID = uuidv4();
        const newMessage = {
            id: messageID,
            content: message,
            date: new Date(),
            sender: yourID,
            read: false,
            reactions: []
        };

        chatbot.messages.push(newMessage);
        await user.save();

        res.status(200).json({ message: 'Message sent successfully', newMessage });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while sending the message' });
    }
};

// export const getChatbotReply = async (req: Request, res: Response): Promise<void> => {
//     const { yourID, chatbotID, chatbotModel, message, modelAPI } = req.body;
//     if (!yourID || !chatbotID || !chatbotModel || !message || !modelAPI) {
//         res.status(400).json({ error: 'Message, modelAPI, chatbotModel, yourID and chatbotID are required' });
//         return;
//     } try {
//         const user = await userModel.findById(yourID);

//         if (!user) {
//             res.status(404).json({ error: 'User not found' });
//             return;
//         }
//         const chatbot = user.chatbots.find(bot => bot.id === chatbotID);

//         if (!chatbot) {
//             res.status(404).json({ error: 'Chatbot not found' });
//             return;
//         }
//         const hf = new HfInference(process.env.HUGGING_FACE_API_KEY);
//         const reply = await hf.textGeneration({
//             model: 'gpt2',
//             inputs: message,
//         })
//         console.log(reply.generated_text)
//     } catch (error) {
//         console.error('Error communicating with chatbot:', error);
//         res.status(500).json({ error: 'Failed to get response from chatbot' });
//     }
// };





//// working!

export const getChatbotReply = async (req: Request, res: Response): Promise<void> => {
    const { yourID, chatbotID, chatbotModel, message, modelAPI } = req.body;
    if (!yourID || !chatbotID || !chatbotModel || !message || !modelAPI) {
        res.status(400).json({ error: 'Message, modelAPI, chatbotModel, yourID and chatbotID are required' });
        return;
    } try {
        const user = await userModel.findById(yourID);

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const chatbot = user.chatbots.find(bot => bot.id === chatbotID);

        if (!chatbot) {
            res.status(404).json({ error: 'Chatbot not found' });
            return;
        }
        const response = await axios.post(
            modelAPI,
            { inputs: message },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const botReply = response.data[0]?.generated_text || 'Sorry, I did not understand that.';
        let formattedBotReply = '';
        console.log(botReply)
        if (chatbotModel !== 'BlenderBot') {
            if (botReply !== 'Sorry, I did not understand that.') {
                formattedBotReply = botReply.substring(message.length);
            }
        } else formattedBotReply = botReply;

        const messageID = uuidv4();
        const newMessage = {
            id: messageID,
            content: formattedBotReply || 'Sorry, I did not understand that.',
            date: new Date(),
            sender: chatbotID,
            read: false,
            reactions: []
        };
        chatbot.messages.push(newMessage);
        await user.save();
        res.json({ reply: formattedBotReply });
    } catch (error) {
        console.error('Error communicating with chatbot:', error);
        res.status(500).json({ error: 'Failed to get response from chatbot' });
    }
};