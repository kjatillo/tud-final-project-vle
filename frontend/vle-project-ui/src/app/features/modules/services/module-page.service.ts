import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { ModulePage } from '../models/module-page.model';

@Injectable({
  providedIn: 'root'
})
export class ModulePageService {
  private modulePagesBaseEndpoint = environment.modulePagesApiEndpoint;

  constructor(private http: HttpClient) { }

  getPages(moduleId: string): Observable<ModulePage[]> {
    return this.http.get<ModulePage[]>(`${this.modulePagesBaseEndpoint}/${moduleId}`);
  }

  addPage(moduleId: string, page: ModulePage): Observable<any> {
    return this.http.post(`${this.modulePagesBaseEndpoint}/${moduleId}`, page);
  }

  editPage(moduleId: string, pageId: string, page: ModulePage): Observable<ModulePage> {
    return this.http.put<ModulePage>(`${this.modulePagesBaseEndpoint}/${moduleId}/${pageId}`, page);
  }

  deletePage(moduleId: string, pageId: string): Observable<any> {
    return this.http.delete(`${this.modulePagesBaseEndpoint}/${moduleId}/${pageId}`);
  }
}
