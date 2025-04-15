import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, Observable } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { DeleteConfirmationDialogComponent } from '../../../../shared/components/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { PaymentService } from '../../../payment/services/payment.service';
import { Module } from '../../models/module.model';
import { EnrolmentService } from '../../services/enrolment.service';
import { ModuleService } from '../../services/module.service';

@Component({
  selector: 'app-module-detail',
  templateUrl: './module-detail.component.html',
  styleUrls: ['./module-detail.component.scss'],
})
export class ModuleDetailComponent implements OnInit {
  @ViewChild('deleteDialog') deleteDialog!: DeleteConfirmationDialogComponent;
  module!: Module;
  moduleId!: string;
  isEnroled!: boolean;
  isAdmin$: Observable<boolean>;
  isModuleInstructor!: boolean;
  showEditModuleForm: boolean = false;
  showGradeSubmissions: boolean = false;
  showViewGrades: boolean = false;
  showParticipants: boolean = false;
  deleteDialogTitle: string = '';
  deleteDialogMessage: string = '';

  constructor(
    private authService: AuthService,
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
    this.deleteDialogTitle = "Confirm Module Deletion";
    this.deleteDialogMessage = "Deleting a module will also delete associated pages and contents permanently. Are you sure you want to do this?";
    this.deleteDialog.show();
  }

  onDeleteConfirmed(confirmed: boolean): void {
    if (!confirmed) return;

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

  toggleGradeAndFeedback(): void {
    this.showGradeSubmissions = !this.showGradeSubmissions;
    this.showViewGrades = false;
    this.showParticipants = false;
  }

  toggleViewGrades(): void {
    this.showViewGrades = !this.showViewGrades;
    this.showGradeSubmissions = false;
    this.showParticipants = false;
  }

  toggleViewParticipants(): void {
    this.showParticipants = !this.showParticipants;
    this.showViewGrades = false;
    this.showGradeSubmissions = false;
  }

  onBackToModuleDetail(refresh: boolean = false): void {
    this.showEditModuleForm = false;
    this.showParticipants = false;
    this.showGradeSubmissions = false;
    this.showViewGrades = false;
    
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
