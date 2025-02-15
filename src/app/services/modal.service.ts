import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ModalService {
  private isLoginModalOpen = new BehaviorSubject<boolean>(false);
  private isRegisterModalOpen = new BehaviorSubject<boolean>(false);

  getLoginModalState(): Observable<boolean> {
    return this.isLoginModalOpen.asObservable();
  }

  getRegisterModalState(): Observable<boolean> {
    return this.isRegisterModalOpen.asObservable();
  }

  openLogin() {
    this.isLoginModalOpen.next(true);
    this.isRegisterModalOpen.next(false);
  }

openRegister() {
  console.log('[ModalService] Opening register modal');
  this.isRegisterModalOpen.next(true);
  this.isLoginModalOpen.next(false);
}
  closeAllModals() {
    this.isLoginModalOpen.next(false);
    this.isRegisterModalOpen.next(false);
  }
}