import mongoose from "mongoose";
import { ChatbotDocument } from "../typescript/interfaces";
import { ChatbotSchema } from "../schemas/chatbot.schema";

const Chatbot = mongoose.model<ChatbotDocument>('chatbots', ChatbotSchema);

export default Chatbot;