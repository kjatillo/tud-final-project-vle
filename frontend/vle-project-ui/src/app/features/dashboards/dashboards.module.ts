import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentDashboardComponent } from './components/student-dashboard/student-dashboard.component';

@NgModule({
  declarations: [
    StudentDashboardComponent
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    StudentDashboardComponent
  ]
})
export class DashboardsModule { }
