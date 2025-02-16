import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { Module } from '../models/module.model';
import { ModuleFile } from '../models/module-file.model';

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

  uploadLectureNote(moduleId: string, moduleFile: ModuleFile): Observable<any> {
    const formData = new FormData();
    formData.append('file', moduleFile.file);
    formData.append('title', moduleFile.title);
    formData.append('description', moduleFile.description);
    
    return this.http.post(`${this.modulesApiEndpoint}/${moduleId}/upload-lecture-note`, formData);
  }

  enrolInModule(id: string | null): Observable<any> {
    return this.http.post(`${this.modulesApiEndpoint}/${id}/enrol`, {});
  }

  isUserEnroled(id: string | null): Observable<boolean> {
    return this.http.get<boolean>(`${this.modulesApiEndpoint}/${id}/is-enroled`);
  }
}
