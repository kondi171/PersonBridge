import { Server as SocketIOServer } from "socket.io";
import { createServer } from "http";
import userModel from "../models/user.model";
import { UserStatus } from "../typescript/enums";

let io: SocketIOServer;

export function getIo() {
    if (!io) {
        throw new Error("Socket.io not initialized");
    }
    return io;
}

export default function startSocketServer(app: any) {
    const server = createServer(app);
    io = new SocketIOServer(server, {
        cors: {
            origin: "http://localhost:4200",
            // origin: "https://personbridge.netlify.app",
            credentials: true
        }
    });

    io.on("connection", async (socket) => {
        const userID = socket.handshake.query.userID;
        console.log(`User connected: ${userID}`);
        if (userID)
            socket.join(userID);
        try {
            const user = await userModel.findById(userID);
            if (user) {
                user.status = UserStatus.ONLINE;
                user.friends.forEach(friend => io.to(friend.id.toString()).emit('statusChange', { from: userID, status: UserStatus.ONLINE }));
                await user.save();
            }
        } catch (error) {
            console.error("Error updating user status to online:", error);
        }
        socket.on("disconnect", async () => {
            console.log(`User disconnected: ${userID}`);
            try {
                const user = await userModel.findById(userID);
                if (user) {
                    user.status = UserStatus.OFFLINE;
                    user.friends.forEach(friend => io.to(friend.id.toString()).emit('statusChange', { from: userID, status: UserStatus.OFFLINE }));
                    await user.save();
                }
            } catch (error) {
                console.error("Error updating user status to offline:", error);
            }
        });
    });

    return server;
}
