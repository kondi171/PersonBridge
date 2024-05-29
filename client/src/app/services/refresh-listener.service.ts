import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class RefreshListenerService {

    constructor(private router: Router) {
        this.listenToRefresh();
    }

    private listenToRefresh() {
        const chatPathPrefix = '/access/chat';

        if (performance.navigation.type === performance.navigation.TYPE_RELOAD) {
            const currentPath = window.location.pathname;
            if (currentPath.startsWith(chatPathPrefix)) {
                this.router.navigate(['/access']);
            }
        }
    }
}
