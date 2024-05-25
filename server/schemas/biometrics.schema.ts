import { Schema } from "mongoose";

export const BiometricsSchema: Schema = new Schema({
    fingerprint: { type: String, required: false },
    voice: { type: String, required: false },
    face: { type: String, required: false }
});