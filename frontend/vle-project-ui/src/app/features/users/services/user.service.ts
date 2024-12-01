import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Register } from '../models/register.model';
import { Login } from '../models/login.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiEndpoint = environment.apiEndpoint;

  constructor(
    private http: HttpClient,
    private router: Router) { }

  register(registerData: Register): Observable<any> {
    return this.http.post(`${this.apiEndpoint}/register`, registerData);
  }

  login(loginData: Login): Observable<any> {
    return this.http.post(`${this.apiEndpoint}/login`, loginData);
  }

  logout(): void {
    this.http.post(`${this.apiEndpoint}/logout`, {}).subscribe(() => {
      localStorage.removeItem('userToken');
      this.router.navigate(['/login']);
    });
  }
}
