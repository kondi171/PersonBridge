import { Schema } from "mongoose";
import { MessageSchema } from "./message.schema";

export const GroupSchema: Schema = new Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    avatar: { type: String, required: true, default: "resources/groups/avatars/Blank-Avatar.jpg" },
    administrator: { type: String, required: true },
    participants: [String],
    accessibility: {
        mute: { type: Boolean, default: false, required: false },
        ignore: { type: Boolean, default: false, required: false }
    },
    messages: [MessageSchema]
});