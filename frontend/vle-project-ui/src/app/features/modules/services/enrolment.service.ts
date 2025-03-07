import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { Module } from '../models/module.model';

@Injectable({
  providedIn: 'root'
})
export class EnrolmentService {
  private enrolmentsBaseEndpoint = environment.enrolmentsApiEndpoint;
  
  constructor(private http: HttpClient) { }

  getEnroledModules(): Observable<Module[]> {
    return this.http.get<Module[]>(`${this.enrolmentsBaseEndpoint}/modules`);
  }
  
  enrolInModule(moduleId: string | null): Observable<any> {
    return this.http.post(`${this.enrolmentsBaseEndpoint}/${moduleId}`, {});
  }

  isUserEnroled(moduleId: string | null): Observable<boolean> {
    return this.http.get<boolean>(`${this.enrolmentsBaseEndpoint}/${moduleId}/status`);
  }
}
