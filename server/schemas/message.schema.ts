import { Schema } from "mongoose";

export const MessageSchema: Schema = new Schema({
    id: { type: String, required: true },
    content: { type: String, required: true },
    date: { type: Date, required: true },
    sender: { type: String, required: true },
    read: { type: Boolean, default: false },
    reactions: [{ userID: String, emoticon: String }]
});