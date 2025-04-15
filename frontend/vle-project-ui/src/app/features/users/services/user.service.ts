import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { Instructor } from '../../modules/models/instructor.model';
import { User } from '../../modules/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private usersBaseEndpoint = environment.usersApiEndpoint;

  constructor(private http: HttpClient) { }

  getInstructors(): Observable<Instructor[]> {
    return this.http.get<Instructor[]>(`${this.usersBaseEndpoint}/instructors`);
  }

  getModuleParticipants(moduleId: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.usersBaseEndpoint}/${moduleId}/participants`)
  }
}
