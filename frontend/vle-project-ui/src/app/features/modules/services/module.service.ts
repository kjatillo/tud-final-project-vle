import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { Module } from '../models/module.model';

@Injectable({
  providedIn: 'root'
})
export class ModuleService {
  private modulesBaseEndpoint = environment.modulesApiEndpoint;

  constructor(private http: HttpClient) { }

  getModules(): Observable<Module[]> {
    return this.http.get<Module[]>(this.modulesBaseEndpoint);
  }

  getModuleById(moduleId: string): Observable<Module> {
    return this.http.get<Module>(`${this.modulesBaseEndpoint}/${moduleId}`);
  }

  createModule(moduleData: Module): Observable<any> {
    return this.http.post(this.modulesBaseEndpoint, moduleData);
  }

  editModule(moduleId: string, moduleData: Module): Observable<any> {
    return this.http.put(`${this.modulesBaseEndpoint}/${moduleId}`, moduleData);
  }

  deleteModule(moduleId: string): Observable<any> {
    return this.http.delete(`${this.modulesBaseEndpoint}/${moduleId}`);
  }
}