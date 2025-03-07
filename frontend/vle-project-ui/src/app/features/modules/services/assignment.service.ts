import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class AssignmentService {
  private assignmentsBaseEndpoint = environment.assignmentsApiEndpoint;
  
  constructor(private http: HttpClient) { }

  addSubmission(formData: FormData): Observable<any> {
    return this.http.post(`${this.assignmentsBaseEndpoint}`, formData);
  }

  getSubmission(contentId: string): Observable<any> {
    return this.http.get(`${this.assignmentsBaseEndpoint}/${contentId}`);
  }
}
