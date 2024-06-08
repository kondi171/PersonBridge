import { Schema } from "mongoose";

export const ChatbotSchema: Schema = new Schema({
    name: { type: String, required: true },
    founder: { type: String, required: true },
    description: { type: String, required: true },
    modelAPI: { type: String, required: true },
});