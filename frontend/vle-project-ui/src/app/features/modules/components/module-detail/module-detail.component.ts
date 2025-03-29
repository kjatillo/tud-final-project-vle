import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { map, Observable } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { PaymentService } from '../../../payment/services/payment.service';
import { Module } from '../../models/module.model';
import { EnrolmentService } from '../../services/enrolment.service';
import { ModuleService } from '../../services/module.service';
import { DeleteConfirmationDialogComponent } from '../delete-confirmation-dialog/delete-confirmation-dialog.component';

@Component({
  selector: 'app-module-detail',
  templateUrl: './module-detail.component.html',
  styleUrls: ['./module-detail.component.scss'],
})
export class ModuleDetailComponent implements OnInit {
  module!: Module;
  moduleId!: string;
  isEnroled!: boolean;
  isAdmin$: Observable<boolean>;
  isModuleInstructor!: boolean;
  showEditModuleForm: boolean = false;
  showGradeSubmissions: boolean = false;
  showViewGrades: boolean = false;

  constructor(
    private authService: AuthService,
    private dialog: MatDialog,
    private enrolmentService: EnrolmentService,
    private moduleService: ModuleService,
    private paymentService: PaymentService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.isAdmin$ = this.authService.userRoles$.pipe(
      map(roles => roles.includes('Admin'))
    );
  }

  ngOnInit(): void {
    this.moduleId = this.route.snapshot.paramMap.get('id')!;

    this.checkEnrolment();

    if (this.moduleId) {
      this.moduleService.getModuleById(this.moduleId).subscribe({
        next: (module) => {
          this.module = module;

          this.authService.currentUser$.pipe(
            map(user => user?.userId === module.moduleInstructor)
          ).subscribe(isInstructor => {
            this.isModuleInstructor = isInstructor;
          });
        },
        error: (error) => console.error('Error fetching module', error),
      });
    }
  }

  checkEnrolment(): void {
    this.enrolmentService.isUserEnroled(this.moduleId).subscribe({
      next: (isEnroled) => this.isEnroled = isEnroled,
      error: (error) => console.error('Error checking enrollment', error),
    });
  }

  payAndEnrol(): void {
    if (this.module) {
      this.paymentService.createCheckoutSession(
        this.module.moduleName,
        this.module.price,
        this.moduleId
      );
    }
  }

  editModule(): void {
    if (this.module) {
      this.showEditModuleForm = true;
    }
  }

  deleteModule(): void {
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      data: {
        title: "Confirm Module Deletion",
        message: "Deleting a module will also delete associated pages and contents permanently. Are you sure you want to do this?"
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.moduleService.deleteModule(this.moduleId).subscribe({
          next: (response) => {
            console.log('Module deleted successfully', response);
            this.router.navigate(['/explore']);
          },
          error: (error) => {
            console.error('Error deleting module', error);
          }
        });
      }
    });
  }

  toggleGradeAndFeedback(): void {
    this.showGradeSubmissions = !this.showGradeSubmissions;
    this.showViewGrades = false;
  }

  toggleViewGrades(): void {
    this.showViewGrades = !this.showViewGrades;
    this.showGradeSubmissions = false;
  }

  onEditModuleCancel(refresh: boolean = false): void {
    this.showEditModuleForm = false;
    
    if (refresh) {
      this.moduleService.getModuleById(this.moduleId).subscribe({
        next: (module) => {
          this.module = module;
        },
        error: (error) => console.error('Error fetching updated module', error),
      });
    }
  }
}