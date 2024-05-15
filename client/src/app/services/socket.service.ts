// src/app/socket.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../app.environment';
import { LoginData } from '../typescript/types';
import { StoreService } from './store.service';

@Injectable({
    providedIn: 'root'
})
export class SocketService {
    private socket: Socket;

    constructor(private storeService: StoreService) {
        this.socket = io(`${environment.serverURL}`);
    }

    public connect() {
        this.socket.connect();
    }

    public disconnect() {
        this.socket.disconnect();
    }

    public onUserStatusChange(): Observable<any> {
        return new Observable(observer => {
            this.socket.on('user-status-change', (data) => {
                observer.next(data);
                console.log('user status change')
            });
        });
    }

    public emitLogin(userID: string) {
        this.socket.emit('login', userID);
    }

    public emitLogout(userID: string) {
        this.socket.emit('logout', userID);
    }
}
