import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WalletStateService {
  private refreshSource = new BehaviorSubject<boolean>(false);
  refresh$ = this.refreshSource.asObservable();

  triggerRefresh() {
    this.refreshSource.next(true);
  }
}