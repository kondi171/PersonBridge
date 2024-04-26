import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ActiveState } from '../../typescript/enums';
import { AppStore } from '../../typescript/interfaces';

const initialStore: AppStore = {
  activeState: ActiveState.PANEL
};

@Injectable({
  providedIn: 'root'
})

export class AppStoreService {
  private store: BehaviorSubject<AppStore> = new BehaviorSubject<AppStore>(initialStore);

  store$: Observable<AppStore> = this.store.asObservable();

  constructor() { }

  changeDynamicState(activeState: ActiveState) {
    const currentStore = this.store.value;
    this.store.next({ ...currentStore, activeState: activeState });
  }
}
