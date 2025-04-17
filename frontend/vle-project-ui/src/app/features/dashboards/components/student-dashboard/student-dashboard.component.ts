import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Module } from '../../../modules/models/module.model';
import { EnrolmentService } from '../../../modules/services/enrolment.service';

@Component({
  selector: 'app-student-dashboard',
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.scss']
})
export class StudentDashboardComponent implements OnInit, OnDestroy {
  enroledModules: Module[] = [];
  isLoadingEnroledModules = false;
  private subscriptions = new Subscription();

  constructor(
    private enrolmentService: EnrolmentService
  ) { }

  ngOnInit(): void {
    this.loadModules();
  }

  loadModules(): void {
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
