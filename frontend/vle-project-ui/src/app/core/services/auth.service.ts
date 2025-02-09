import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Login } from '../../features/users/models/login.model';
import { Register } from '../../features/users/models/register.model';
import { User } from '../../features/users/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiEndpoint = environment.usersApiEndpoint;
  private loggedIn$ = new BehaviorSubject<boolean>(false);
  private roles$ = new BehaviorSubject<string[]>([]);
  private user$ = new BehaviorSubject<User | null>(null);
  private isLoggingOut = false;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.checkAuthStatus();
  }

  private checkAuthStatus(): void {
    if (this.isLoggingOut) {
      return;
    }

    this.http.get(`${this.apiEndpoint}/verify-token`)
      .pipe(
        catchError((error) => {
          this.clearAuthState();
          
          return throwError(() => error);
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response && response.isValid) {
            this.loggedIn$.next(true);
            this.roles$.next(response.roles || []);
            this.getCurrentUser().subscribe();
          } else {
            this.clearAuthState();
          }
        }
      });
  }

  private clearAuthState(): void {
    this.loggedIn$.next(false);
    this.roles$.next([]);
    this.user$.next(null);
  }

  get isLoggedIn$(): Observable<boolean> {
    return this.loggedIn$.asObservable();
  }

  get userRoles$(): Observable<string[]> {
    return this.roles$.asObservable();
  }

  get currentUser$(): Observable<User | null> {
    return this.user$.asObservable();
  }

  register(registerData: Register): Observable<any> {
    return this.http.post(`${this.apiEndpoint}/register`, registerData);
  }

  login(loginData: Login): Observable<any> {
    return this.http.post(`${this.apiEndpoint}/login`, loginData)
      .pipe(
        tap((response: any) => {
          if (response && response.user && response.user.roleName) {
            this.loggedIn$.next(true);
            this.roles$.next([response.user.roleName]);
            this.getCurrentUser().subscribe();
          }
        }),
        catchError((error) => {
          console.error('Login error:', error); 
          this.clearAuthState();
          
          return throwError(() => error);
        })
      );
  }

  logout(): void {
    this.isLoggingOut = true;

    this.http.post(`${this.apiEndpoint}/logout`, {})
      .subscribe({
        next: () => {
          this.clearAuthState();
          this.router.navigate(['/login']);
          this.isLoggingOut = false;
        },
        error: (error) => {
          console.error('Logout error:', error);
          
          this.clearAuthState();
          this.router.navigate(['/login']);
          this.isLoggingOut = false;
        }
      });
  }

  getCurrentUser(): Observable<User | null> {
    return this.http.get<User>(`${this.apiEndpoint}/current-user`)
      .pipe(
        tap((user: User | null) => {
          this.user$.next(user);
        }),
        catchError((error) => {
          console.error('Get current user error:', error);
          
          return throwError(() => error);
        })
      );
  }
}