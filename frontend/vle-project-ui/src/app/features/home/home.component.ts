import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { ModuleService } from '../modules/services/module.service';
import { Module } from '../modules/models/module.model';

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
    private moduleService: ModuleService
  ) { }

  ngOnInit(): void {
    this.authService.isLoggedIn.subscribe((loggedIn) => {
      this.isLoggedIn = loggedIn;
      if (loggedIn) {
        this.moduleService.getEnroledModules().subscribe({
          next: (modules) => {
            this.enroledModules = modules;
          },
          error: (error) => console.error('Error fetching enrolled modules', error),
        });
      }
    });
  }
}
