import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentDashboardComponent } from './components/student-dashboard/student-dashboard.component';
import { InstructorDashboardComponent } from './components/instructor-dashboard/instructor-dashboard.component';

@NgModule({
  declarations: [
    InstructorDashboardComponent,
    StudentDashboardComponent
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    InstructorDashboardComponent,
    StudentDashboardComponent
  ]
})
export class DashboardsModule { }
