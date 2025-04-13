import { Component, OnInit } from '@angular/core';
import { catchError, Observable, of, switchMap } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { Module } from '../../../modules/models/module.model';
import { EnrolmentService } from '../../../modules/services/enrolment.service';

@Component({
  selector: 'app-student-dashboard',
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.scss']
})
export class StudentDashboardComponent implements OnInit {
  isLoggedIn$: Observable<boolean>;
  enroledModules$: Observable<Module[]>;

  constructor(
    private authService: AuthService,
    private enrolmentService: EnrolmentService
  ) {
    this.isLoggedIn$ = this.authService.isLoggedIn$;
    this.enroledModules$ = of([]);
  }

  ngOnInit(): void {
    this.enroledModules$ = this.isLoggedIn$.pipe(
      switchMap((loggedIn) => {
        if (loggedIn) {
          return this.enrolmentService.getEnroledModules().pipe(
            catchError((error) => {
              console.error('Error fetching enrolled modules', error);
              return of([]);
            })
          );
        } else {
          return of([]);
        }
      })
    );
  }
}
