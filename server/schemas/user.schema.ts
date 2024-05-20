import { Schema } from "mongoose";
import { UserStatus } from "../typescript/enums";
import { FriendSchema } from "./friend.schema";

export const UserSchema: Schema = new Schema({
    name: { type: String, required: true },
    lastname: { type: String, required: true },
    mail: { type: String, required: true },
    password: { type: String, required: true },
    avatar: { type: String, required: true, default: "resources/avatars/Blank-Avatar.jpg" },
    status: { type: String, required: true, default: UserStatus.ONLINE },
    biometrics: {
        fingerprint: { type: String, required: false },
        voice: { type: String, required: false },
        face: { type: String, required: false }
    },
    friends: [FriendSchema],
    requests: { received: [String], sent: [String] },
    blocked: [String],
    chatbots: []
});