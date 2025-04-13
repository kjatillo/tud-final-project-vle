import { Component, OnInit } from '@angular/core';
import { catchError, Observable, of, switchMap } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { Module } from '../../../modules/models/module.model';
import { EnrolmentService } from '../../../modules/services/enrolment.service';
import { ModuleService } from '../../../modules/services/module.service';

@Component({
  selector: 'app-instructor-dashboard',
  templateUrl: './instructor-dashboard.component.html',
  styleUrls: ['./instructor-dashboard.component.scss']
})
export class InstructorDashboardComponent implements OnInit {
  isLoggedIn$: Observable<boolean>;
  enroledModules$: Observable<Module[]>;
  instructorModules$: Observable<Module[]>;

  constructor(
    private authService: AuthService,
    private enrolmentService: EnrolmentService,
    private moduleService: ModuleService
  ) {
    this.isLoggedIn$ = this.authService.isLoggedIn$;
    this.enroledModules$ = of([]);
    this.instructorModules$ = of([]);
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

    this.instructorModules$ = this.isLoggedIn$.pipe(
      switchMap((loggedIn) => {
        if (loggedIn) {
          return this.moduleService.getInstructorModules().pipe(
            catchError((error) => {
              console.error('Error fetching instructor modules', error);
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
