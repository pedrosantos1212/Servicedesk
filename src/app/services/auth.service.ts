import { Injectable, signal } from '@angular/core';

export type UserRole = 'employee' | 'it-sistemas' | 'it-infra' | null;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private roleSignal = signal<UserRole>(null);
  private userNameSignal = signal<string>('');

  readonly role = this.roleSignal.asReadonly();
  readonly userName = this.userNameSignal.asReadonly();

  login(role: UserRole, name: string) {
    this.roleSignal.set(role);
    this.userNameSignal.set(name);
  }

  logout() {
    this.roleSignal.set(null);
    this.userNameSignal.set('');
  }
}
