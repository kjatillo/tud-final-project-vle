import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private usersBaseEndpoint = environment.usersApiEndpoint;

  constructor(private http: HttpClient) { }

  getInstructors(): Observable<User[]> {
    return this.http.get<User[]>(`${this.usersBaseEndpoint}/instructors`);
  }

  getModuleParticipants(moduleId: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.usersBaseEndpoint}/${moduleId}/participants`)
  }
}
