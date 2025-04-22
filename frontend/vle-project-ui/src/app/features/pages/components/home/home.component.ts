import { Component, OnInit } from '@angular/core';
import { catchError, Observable, of, switchMap } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { Module } from '../../../modules/models/module.model';
import { EnrolmentService } from '../../../modules/services/enrolment.service';
import { User } from '../../../users/models/user.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  isLoggedIn$: Observable<boolean>;
  isAuthResolved$: Observable<boolean>;
  currentUser$: Observable<User | null>;
  enroledModules$: Observable<Module[]>;

  constructor(
    private authService: AuthService,
    private enrolmentService: EnrolmentService
  ) {
    this.isLoggedIn$ = this.authService.isLoggedIn$;
    this.isAuthResolved$ = this.authService.isAuthResolved;
    this.currentUser$ = this.authService.currentUser$;
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