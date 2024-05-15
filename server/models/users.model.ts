import mongoose, { Schema } from "mongoose";
import { UserDocument } from "../typescript/interfaces";
import { MessageSender, UserStatus } from "../typescript/enums";

const UserSchema: Schema = new Schema({
    name: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    mail: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        required: true,
        default: "resources/avatars/Blank-Avatar.jpg"
    },
    status: {
        type: String,
        required: true,
        default: UserStatus.ONLINE
    },
    biometrics: {
        fingerprint: {
            type: String,
            required: false
        },
        voice: {
            type: String,
            required: false
        },
        face: {
            type: String,
            required: false
        }
    },
    friends: [
        {
            id: String,
            settings: {
                nickname: String,
                PIN: Number,
            },
            messages: [
                {
                    content: String,
                    date: String,
                    sender: String
                }
            ]
        }
    ],
    requests: {
        received: [String],
        sent: [String]
    },
    blocked: [String],
    chatbots: []
});

const User = mongoose.model<UserDocument>('users', UserSchema);

export default User;
