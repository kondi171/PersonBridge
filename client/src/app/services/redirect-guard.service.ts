import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { StoreService } from './store.service';

@Injectable({
    providedIn: 'root'
})
export class RedirectGuard implements CanActivate {

    constructor(private storeService: StoreService, private router: Router) { }

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        const loggedUser = this.storeService.getLoggedUser();
        if (loggedUser) {
            // Użytkownik zalogowany, przekierowanie do strony głównej
            this.router.navigate(['/access']);
            return false;
        }
        return true;
    }
}
