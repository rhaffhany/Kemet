import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private loginModalState = new BehaviorSubject<boolean>(false);
  private registerModalState = new BehaviorSubject<boolean>(false);

  getLoginModalState() {
    return this.loginModalState.asObservable();
  }
  openRegister(): void {
    this.registerModalState.next(true);
  }
  getRegisterModalState() {
    return this.registerModalState.asObservable();
  }

  openLogin() {
    this.loginModalState.next(true);
  }


  closeAllModals() {
    this.loginModalState.next(false);
    this.registerModalState.next(false);
  }
}