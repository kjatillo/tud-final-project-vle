import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Module } from '../modules/models/module.model';
import { EnrolmentService } from '../modules/services/enrolment.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  isLoggedIn = false;
  enroledModules: Module[] = [];

  constructor(
    private authService: AuthService,
    private enrolmentService: EnrolmentService
  ) { }

  ngOnInit(): void {
    this.authService.isLoggedIn$.subscribe((loggedIn) => {
      this.isLoggedIn = loggedIn;
      if (loggedIn) {
        this.enrolmentService.getEnroledModules().subscribe({
          next: (modules) => {
            this.enroledModules = modules;
          },
          error: (error) => console.error('Error fetching enrolled modules', error),
        });
      }
    });
  }
}
