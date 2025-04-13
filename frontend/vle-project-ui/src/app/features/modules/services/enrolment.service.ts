import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { Module } from '../models/module.model';
import { MonthlyTrend } from '../models/monthly-trend.model';

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

  getTotalEnrolmentsCount(): Observable<number> {
    return this.http.get<number>(`${this.enrolmentsBaseEndpoint}/count/total`);
  }

  getModuleEnrolmentsCount(moduleId: string): Observable<number> {
    return this.http.get<number>(`${this.enrolmentsBaseEndpoint}/count/module/${moduleId}`);
  }

  getMonthlyEnrolmentTrends(year: number): Observable<MonthlyTrend[]> {
    return this.http.get<MonthlyTrend[]>(`${this.enrolmentsBaseEndpoint}/trends/monthly?year=${year}`);
  }
}
