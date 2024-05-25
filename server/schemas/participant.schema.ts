import { Schema } from "mongoose";

export const ParticipantSchema = new Schema({
    id: { type: String, required: true },
    nickname: { type: String, required: true }
});
