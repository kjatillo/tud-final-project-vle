import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentDashboardComponent } from './components/student-dashboard/student-dashboard.component';
import { InstructorDashboardComponent } from './components/instructor-dashboard/instructor-dashboard.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';

@NgModule({
  declarations: [
    AdminDashboardComponent,
    InstructorDashboardComponent,
    StudentDashboardComponent
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    AdminDashboardComponent,
    InstructorDashboardComponent,
    StudentDashboardComponent
  ]
})
export class DashboardsModule { }
