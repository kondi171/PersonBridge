import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../app.environment';
import { StoreService } from './store.service';

@Injectable({
    providedIn: 'root'
})
export class SocketService {
    private socket: Socket | undefined;

    constructor(private storeService: StoreService) { }

    connect(userID: string) {
        if (this.socket && this.socket.connected) {
            console.log("Already connected");
            return;
        }
        this.socket = io(environment.serverURL, {
            withCredentials: true,
            autoConnect: false,
            query: { userID }
        });
        this.socket.connect();
        this.socket.on('messageToUserSent', (data: any) => {
            this.storeService.notifyNewMessage();
        });
        this.socket.on('messageToGroupSent', (data: any) => {
            this.storeService.notifyNewMessage();
        });
        this.socket.on('addReactionToUser', (data: any) => {
            this.storeService.notifyNewMessage();
        });
        this.socket.on('addReactionToGroup', (data: any) => {
            this.storeService.notifyNewMessage();
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }

    onStatusChange(callback: (data: any) => void) {
        if (this.socket) {
            this.socket.on('statusChange', callback);
        }
    }

    onSendRequest(callback: (data: any) => void) {
        if (this.socket) {
            this.socket.on('sendRequest', callback);
        }
    }

    onCancelRequest(callback: (data: any) => void) {
        if (this.socket) {
            this.socket.on('cancelRequest', callback);
        }
    }

    onAcceptRequest(callback: (data: any) => void) {
        if (this.socket) {
            this.socket.on('acceptRequest', callback);
        }
    }

    onIgnoreRequest(callback: (data: any) => void) {
        if (this.socket) {
            this.socket.on('ignoreRequest', callback);
        }
    }

    onMessageToUserSent(callback: (data: any) => void) {
        if (this.socket) {
            this.socket.on('messageToUserSent', callback);
        }
    }
    onMessageToGroupSent(callback: (data: any) => void) {
        if (this.socket) {
            this.socket.on('messageToGroupSent', callback);
        }
    }

    onMarkMessageAsRead(callback: (data: any) => void) {
        if (this.socket) {
            this.socket.on('markMessageAsRead', callback);
        }
    }

    onAddReactionToUser(callback: (data: any) => void) {
        if (this.socket) {
            this.socket.on('addReactionToUser', callback);
        }
    }
    onAddReactionToGroup(callback: (data: any) => void) {
        if (this.socket) {
            this.socket.on('addReactionToGroup', callback);
        }
    }
}
