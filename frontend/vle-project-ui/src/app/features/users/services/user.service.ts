import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Register } from '../models/register.model';
import { Login } from '../models/login.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiEndpoint = environment.apiEndpoint;

  constructor(private http: HttpClient) { }

  register(registerData: Register): Observable<any> {
    return this.http.post(`${this.apiEndpoint}/register`, registerData);
  }

  login(loginData: Login): Observable<any> {
    return this.http.post(`${this.apiEndpoint}/login`, loginData);
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiEndpoint}/logout`, {});
  }
}
