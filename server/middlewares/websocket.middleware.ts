import { Server as SocketIOServer } from "socket.io";
import { createServer } from "http";
import userModel from "../models/users.model";

export default function startSocketServer(app: any) {
    const server = createServer(app);
    const io = new SocketIOServer(server, {
        cors: {
            origin: "http://localhost:4200",
            credentials: true
        }
    });
    let userID: string = '';

    const updateUserStatus = async (userId: string, status: string) => {
        // try {
        //     const user = await userModel.findById(userId);
        //     if (user) {
        //         user.status = status;
        //         await user.save();
        //     } else console.log("User not found");
        // } catch (error) {
        //     console.error("Error updating user status:", error);
        // }
    };

    io.on("connection", socket => {
        // socket.on("login", async (userId: string) => {
        //     console.log(`${userId} logged in`);
        //     userID = userId;
        //     await updateUserStatus(userId, "Online");
        // });

        // socket.on("logout", async (userId: string) => {
        //     console.log(`${userId} logged out`);
        //     await updateUserStatus(userId, "Offline");
        // });

        // socket.on("disconnect", () => {
        //     console.log(`${userID} disconnected`);
        //     updateUserStatus(userID, "Offline");
        // });
    });

    return server;
}
