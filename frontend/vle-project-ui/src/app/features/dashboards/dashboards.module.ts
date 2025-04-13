import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { InstructorDashboardComponent } from './components/instructor-dashboard/instructor-dashboard.component';
import { StudentDashboardComponent } from './components/student-dashboard/student-dashboard.component';

@NgModule({
  declarations: [
    AdminDashboardComponent,
    InstructorDashboardComponent,
    StudentDashboardComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatProgressSpinnerModule
  ],
  exports: [
    AdminDashboardComponent,
    InstructorDashboardComponent,
    StudentDashboardComponent
  ]
})
export class DashboardsModule { }
