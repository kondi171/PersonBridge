import { Schema } from "mongoose";

export const AccessibilitySchema: Schema = new Schema({
    mute: { type: Boolean, default: false, required: true },
    ignore: { type: Boolean, default: false, required: true },
    block: { type: Boolean, default: false, required: true }
});