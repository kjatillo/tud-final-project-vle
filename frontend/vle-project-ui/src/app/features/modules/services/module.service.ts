import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Module } from '../models/module.model';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ModuleService {
  private modulesApiEndpoint = environment.modulesApiEndpoint;

  constructor(private http: HttpClient) { }

  getAllModules(): Observable<Module[]> {
    return this.http.get<Module[]>(this.modulesApiEndpoint);
  }

  getModuleById(id: string): Observable<Module> {
    return this.http.get<Module>(`${this.modulesApiEndpoint}/${id}`);
  }

  createModule(moduleData: Module): Observable<any> {
    const token = localStorage.getItem('userToken');
    if (!token) {
      throw new Error('No token found');
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(this.modulesApiEndpoint, moduleData, { headers });
  }

  editModule(id: string, moduleData: Module): Observable<any> {
    const token = localStorage.getItem('userToken');
    if (!token) {
      throw new Error('No token found');
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put(`${this.modulesApiEndpoint}/${id}`, moduleData, { headers });
  }

  enrolInModule(id: string | null): Observable<any> {
    const token = localStorage.getItem('userToken');
    if (!token) {
      throw new Error('No token found');
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.modulesApiEndpoint}/${id}/enrol`, {}, { headers });
  }

  isUserEnroled(id: string | null): Observable<boolean> {
    const token = localStorage.getItem('userToken');
    if (!token) {
      throw new Error('No token found');
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<boolean>(`${this.modulesApiEndpoint}/${id}/isEnroled`, { headers });
  }
}
