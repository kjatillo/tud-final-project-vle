import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ModuleContent } from '../models/module-content.model';

@Injectable({
  providedIn: 'root'
})
export class ModuleContentService {
  private moduleContentsBaseEndpoint = environment.moduleContentsApiEndpoint;

  constructor(private http: HttpClient) { }

  getContents(moduleId: string, pageId: string): Observable<any> {
    return this.http.get(`${this.moduleContentsBaseEndpoint}/${moduleId}/${pageId}`);
  }

  getContentById(moduleId: string, pageId: string, contentId: string): Observable<ModuleContent> {
    return this.http.get<ModuleContent>(`${this.moduleContentsBaseEndpoint}/${moduleId}/${pageId}/${contentId}`);
  }

  addContent(moduleId: string, pageId: string, content: FormData): Observable<any> {
    return this.http.post(`${this.moduleContentsBaseEndpoint}/${moduleId}/${pageId}`, content);
  }

  editContent(moduleId: string, pageId: string, contentId: string, content: FormData): Observable<ModuleContent> {
    return this.http.put<ModuleContent>(`${this.moduleContentsBaseEndpoint}/${moduleId}/${pageId}/${contentId}`, content);
  }

  deleteContent(moduleId: string, pageId: string, contentId: string): Observable<any> {
    return this.http.delete(`${this.moduleContentsBaseEndpoint}/${moduleId}/${pageId}/${contentId}`);
  }
}
