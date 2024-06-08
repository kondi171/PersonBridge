import { Schema } from "mongoose";

export const SettingsSchema: Schema = new Schema({
    nickname: { type: String, required: true },
    PIN: { type: Number, default: 0 }
});