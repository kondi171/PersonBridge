import mongoose, { Schema } from "mongoose";
import { UserDocument } from "../typescript/interfaces";
import { UserStatus } from "../typescript/enums";

const MessageSchema: Schema = new Schema({
    content: { type: String, required: true },
    date: { type: Date, required: true },
    sender: { type: Number, required: true },
    read: { type: Boolean, default: false }
});

const FriendSchema: Schema = new Schema({
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

const UserSchema: Schema = new Schema({
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

const User = mongoose.model<UserDocument>('users', UserSchema);

export default User;