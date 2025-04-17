import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Module } from '../../../modules/models/module.model';
import { EnrolmentService } from '../../../modules/services/enrolment.service';
import { ModuleService } from '../../../modules/services/module.service';

@Component({
  selector: 'app-instructor-dashboard',
  templateUrl: './instructor-dashboard.component.html',
  styleUrls: ['./instructor-dashboard.component.scss']
})
export class InstructorDashboardComponent implements OnInit, OnDestroy {
  instructorModules: Module[] = [];
  enroledModules: Module[] = [];
  isLoadingInstructorModules = false;
  isLoadingEnroledModules = false;
  private subscriptions = new Subscription();

  constructor(
    private enrolmentService: EnrolmentService,
    private moduleService: ModuleService
  ) { }

  ngOnInit(): void {
    this.loadModules();
  }

  loadModules(): void {
    this.isLoadingInstructorModules = true;
    const instructorSub = this.moduleService.getInstructorModules()
      .pipe(
        finalize(() => this.isLoadingInstructorModules = false)
      )
      .subscribe({
        next: (modules) => this.instructorModules = modules,
        error: (err) => console.error('Error loading instructor modules', err)
      });
    this.subscriptions.add(instructorSub);

    this.isLoadingEnroledModules = true;
    const enrolledSub = this.enrolmentService.getEnroledModules()
      .pipe(
        finalize(() => this.isLoadingEnroledModules = false)
      )
      .subscribe({
        next: (modules) => this.enroledModules = modules,
        error: (err) => console.error('Error loading enrolled modules', err)
      });
    this.subscriptions.add(enrolledSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
