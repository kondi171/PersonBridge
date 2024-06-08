import { Schema } from "mongoose";
import { UserStatus } from "../typescript/enums";
import { FriendSchema } from "./friend.schema";
import { GroupSchema } from "./group.schema";
import { BiometricsSchema } from "./biometrics.schema";
import { ChatbotSchema } from "./chatbot.schema";
import { MessageSchema } from "./message.schema";
import { SettingsSchema } from "./settings.schema";

export const UserSchema: Schema = new Schema({
    name: { type: String, required: true },
    lastname: { type: String, required: true },
    mail: { type: String, required: true },
    password: { type: String, required: true },
    avatar: { type: String, required: true, default: "resources/users/avatars/Blank-Avatar.jpg" },
    status: { type: String, required: true, default: UserStatus.ONLINE },
    // biometrics: BiometricsSchema,
    friends: [FriendSchema],
    groups: [GroupSchema],
    requests: { received: [String], sent: [String] },
    blocked: [String],
    chatbots: [{
        id: { type: String, required: true },
        name: { type: String, required: true },
        founder: { type: String, required: true },
        description: { type: String, required: true },
        modelAPI: { type: String, required: true },
        settings: SettingsSchema,
        messages: [MessageSchema]
    }]
});