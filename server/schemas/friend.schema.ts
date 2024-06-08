import { Schema } from "mongoose";
import { MessageSchema } from "./message.schema";
import { AccessibilitySchema } from "./accessibility.schema";
import { SettingsSchema } from "./settings.schema";

export const FriendSchema: Schema = new Schema({
    id: { type: String, required: true },
    settings: SettingsSchema,
    accessibility: AccessibilitySchema,
    messages: [MessageSchema]
});