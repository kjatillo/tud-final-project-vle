import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Register } from '../models/register.model';
import { Login } from '../models/login.model';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiEndpoint = environment.apiEndpoint;

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService) { }

  register(registerData: Register): Observable<any> {
    return this.http.post(`${this.apiEndpoint}/register`, registerData);
  }

  login(loginData: Login): Observable<any> {
    return this.http.post(`${this.apiEndpoint}/login`, loginData).pipe(
      tap((response: any) => {
        this.authService.login(response.token);
      })
    );
  }

  logout(): void {
    this.http.post(`${this.apiEndpoint}/logout`, {}).subscribe(() => {
      this.authService.logout();
      this.router.navigate(['/login']);
    });
  }
}
