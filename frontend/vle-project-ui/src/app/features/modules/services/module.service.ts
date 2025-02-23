import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { Module } from '../models/module.model';
import { ModulePage } from '../models/module-page.model';

@Injectable({
  providedIn: 'root'
})
export class ModuleService {
  private modulesApiEndpoint = environment.modulesApiEndpoint;

  constructor(private http: HttpClient) { }

  getModules(): Observable<Module[]> {
    return this.http.get<Module[]>(this.modulesApiEndpoint);
  }

  getModuleById(id: string): Observable<Module> {
    return this.http.get<Module>(`${this.modulesApiEndpoint}/${id}`);
  }

  getEnroledModules(): Observable<Module[]> {
    return this.http.get<Module[]>(`${this.modulesApiEndpoint}/enroled`);
  }

  createModule(moduleData: Module): Observable<any> {
    return this.http.post(this.modulesApiEndpoint, moduleData);
  }

  editModule(id: string, moduleData: Module): Observable<any> {
    return this.http.put(`${this.modulesApiEndpoint}/${id}`, moduleData);
  }

  deleteModule(id: string | null): Observable<any> {
    return this.http.delete(`${this.modulesApiEndpoint}/${id}`);
  }

  getPages(moduleId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.modulesApiEndpoint}/${moduleId}/pages`);
  }

  addPage(moduleId: string, page: ModulePage): Observable<any> {
    return this.http.post(`${this.modulesApiEndpoint}/${moduleId}/add-page`, page);
  }

  addContent(moduleId: string, pageId: string, content: FormData): Observable<any> {
    return this.http.post(`${this.modulesApiEndpoint}/${moduleId}/pages/${pageId}/add-content`, content);
  }

  getContents(moduleId: string, pageId: string): Observable<any> {
    return this.http.get(`${this.modulesApiEndpoint}/${moduleId}/pages/${pageId}/contents`);
  }

  enrolInModule(id: string | null): Observable<any> {
    return this.http.post(`${this.modulesApiEndpoint}/${id}/enrol`, {});
  }

  isUserEnroled(id: string | null): Observable<boolean> {
    return this.http.get<boolean>(`${this.modulesApiEndpoint}/${id}/is-enroled`);
  }
}
