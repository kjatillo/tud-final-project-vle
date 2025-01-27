import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Module } from '../models/module.model';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ModuleService {
  private modules = environment.modulesApiEndpoint;

  constructor(private http: HttpClient) { }

  createModule(moduleData: Module): Observable<any> {
    const token = localStorage.getItem('userToken');
    if (!token) {
      throw new Error('No token found');
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(this.modules, moduleData, { headers });
  }

  getModuleById(id: string): Observable<Module> {
    return this.http.get<Module>(`${this.modules}/${id}`);
  }
}
