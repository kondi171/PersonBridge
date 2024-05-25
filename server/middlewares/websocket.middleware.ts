import { Server as SocketIOServer } from "socket.io";
import { createServer } from "http";
import userModel from "../models/user.model";
import { UserStatus } from "../typescript/enums";

export default function startSocketServer(app: any) {
    const server = createServer(app);
    const io = new SocketIOServer(server, {
        cors: {
            origin: "http://localhost:4200",
            credentials: true
        }
    });

    const updateUserStatus = async (userID: string, status: UserStatus) => {
        try {
            if (!userID) {
                throw new Error("Invalid userID");
            }
            const user = await userModel.findById(userID);
            if (user) {
                user.status = status;
                await user.save();
            } else {
                console.log("User not found");
            }
        } catch (error) {
            console.error("Error updating user status:", error);
        }
    };

    io.on("connection", socket => {
        socket.on("login", async (userID: string) => {
            if (userID) {
                socket.data.userID = userID; // Store userID in socket session
                console.log(`${userID} logged in`);
                await updateUserStatus(userID, UserStatus.ONLINE);
            } else {
                console.log("Invalid login attempt with empty userID");
            }
        });

        socket.on("logout", async () => {
            const userID = socket.data.userID;
            if (userID) {
                console.log(`${userID} logged out`);
                await updateUserStatus(userID, UserStatus.OFFLINE);
            } else {
                console.log("Invalid logout attempt with empty userID");
            }
        });

        socket.on("disconnect", async () => {
            const userID = socket.data.userID;
            if (userID) {
                console.log(`${userID} disconnected`);
                await updateUserStatus(userID, UserStatus.OFFLINE);
            } else {
                console.log("Invalid disconnect attempt with empty userID");
            }
        });
    });

    return server;
}
