import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiEndpoint: string = environment.apiEndpoint;

  constructor(private http: HttpClient) { }

  addUser(user: User): Observable<User> {
    return this.http.post<User>(this.apiEndpoint, user);
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiEndpoint);
  }
}
