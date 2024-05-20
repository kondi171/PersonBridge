import { Schema } from "mongoose";
import { MessageSchema } from "./message.schema";

export const FriendSchema: Schema = new Schema({
    id: { type: String, required: true },
    settings: {
        nickname: { type: String, required: true },
        PIN: { type: Number, default: 0 }
    },
    accessibility: {
        mute: { type: Boolean, default: false, required: true },
        ignore: { type: Boolean, default: false, required: true },
        block: { type: Boolean, default: false, required: true }
    },
    messages: [MessageSchema]
});