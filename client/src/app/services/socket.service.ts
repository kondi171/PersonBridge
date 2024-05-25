import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { StoreService } from './store.service';
import { environment } from '../app.environment';

@Injectable({
    providedIn: 'root'
})
export class SocketService {
    private socket: Socket;

    constructor(private storeService: StoreService) {
        this.socket = io(environment.serverURL, {
            withCredentials: true,
            autoConnect: false
        });

        // Listen for user status change events
        this.socket.on('user-status-change', (data: { userID: string, status: string }) => {
            console.log('statusChange')
            const loggedUser = this.storeService.getLoggedUser();
            if (loggedUser && loggedUser._id === data.userID) {
                this.storeService.updateUserStatus(data.status);
            }
        });
    }

    public connect(userID: string) {
        this.socket.io.opts.query = { userID };
        this.socket.connect();
        console.log(userID)
    }

    public disconnect() {
        this.socket.emit('logout');
        this.socket.disconnect();
    }

    public emitLogin(userID: string) {
        this.socket.emit('login', userID);
    }

    public emitLogout() {
        this.socket.emit('logout');
    }
}
