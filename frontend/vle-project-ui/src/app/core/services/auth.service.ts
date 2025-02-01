import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedIn = new BehaviorSubject<boolean>(!!localStorage.getItem('userToken'));
  private roles = new BehaviorSubject<string[]>(this.getRolesFromLocalStorage());

  get isLoggedIn() {
    return this.loggedIn.asObservable();
  }

  get userRoles() {
    return this.roles.asObservable();
  }

  login(token: string, userId: string, roles: string[]) {
    localStorage.setItem('userToken', token);
    localStorage.setItem('userId', userId);
    localStorage.setItem('roles', JSON.stringify(roles || []));
    this.loggedIn.next(true);
    this.roles.next(roles || []);
  }

  logout() {
    localStorage.removeItem('userToken');
    localStorage.removeItem('roles');
    this.loggedIn.next(false);
    this.roles.next([]);
  }

  hasRole(role: string): boolean {
    return this.roles.value.includes(role);
  }

  private getRolesFromLocalStorage(): string[] {
    const roles = localStorage.getItem('roles');
    try {
      return roles ? JSON.parse(roles) : [];
    } catch (error) {
      console.error('Error parsing roles from localStorage', error);
      return [];
    }
  }
}
