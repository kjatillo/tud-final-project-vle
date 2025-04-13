import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { AssignmentStats } from '../models/assignment-stats.model';
import { ModuleAnalytics } from '../models/module-analytics.model';

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
    return this.http.get(`${this.assignmentsBaseEndpoint}/submissions/content/${contentId}`);
  }

  getStudentSubmissions(moduleId: string): Observable<any> {
    return this.http.get(`${this.assignmentsBaseEndpoint}/submissions/student/${moduleId}`);
  }

  getModuleAssignments(moduleId: string): Observable<any> {
    return this.http.get(`${this.assignmentsBaseEndpoint}/module/${moduleId}`);
  }

  getGrades(contentId: string): Observable<any> {
    return this.http.get(`${this.assignmentsBaseEndpoint}/grades/${contentId}`);
  }

  updateGrade(submissionId: string, updateGradeDto: { grade: number, feedback: string }): Observable<any> {
    return this.http.put(`${this.assignmentsBaseEndpoint}/grades/${submissionId}`, updateGradeDto);
  }

  deleteGrade(submissionId: string): Observable<any> {
    return this.http.delete(`${this.assignmentsBaseEndpoint}/grades/${submissionId}`);
  }

  getAssignmentStats(): Observable<AssignmentStats> {
    return this.http.get<AssignmentStats>(`${this.assignmentsBaseEndpoint}/stats`);
  }

  getModuleAnalytics(moduleId: string): Observable<ModuleAnalytics> {
    return this.http.get<ModuleAnalytics>(`${this.assignmentsBaseEndpoint}/module-analytics/${moduleId}`);
  }
}
