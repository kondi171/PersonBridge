import mongoose from "mongoose";
import { UserDocument } from "../typescript/interfaces";
import { UserSchema } from "../schemas/user.schema";

const User = mongoose.model<UserDocument>('users', UserSchema);

export default User;