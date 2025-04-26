import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, Observable, Subscription } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { DeleteConfirmationDialogComponent } from '../../../../shared/components/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { MessageDialogComponent } from '../../../../shared/components/message-dialog/message-dialog.component';
import { DIALOG_MESSAGES } from '../../../../shared/constants/dialog-messages';
import { NotificationService } from '../../../../shared/services/notification.service';
import { PaymentService } from '../../../payment/services/payment.service';
import { Module } from '../../models/module.model';
import { EnrolmentService } from '../../services/enrolment.service';
import { ModuleService } from '../../services/module.service';

@Component({
  selector: 'app-module-detail',
  templateUrl: './module-detail.component.html',
  styleUrls: ['./module-detail.component.scss'],
})
export class ModuleDetailComponent implements OnInit, OnDestroy {
  @ViewChild('deleteDialog') deleteDialog!: DeleteConfirmationDialogComponent;
  @ViewChild('msgDialog') msgDialog!: MessageDialogComponent;
  module!: Module;
  moduleId!: string;
  isEnroled!: boolean;
  isAdmin$: Observable<boolean>;
  isModuleInstructor!: boolean;
  showEditModuleForm: boolean = false;
  showGradeSubmissions: boolean = false;
  showViewGrades: boolean = false;
  showParticipants: boolean = false;
  isRedirectingToStripe: boolean = false;
  deleteDialogTitle: string = '';
  deleteDialogMessage: string = '';
  private subscriptions: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private enrolmentService: EnrolmentService,
    private moduleService: ModuleService,
    private notificationService: NotificationService,
    private paymentService: PaymentService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.isAdmin$ = this.authService.userRoles$.pipe(
      map(roles => roles.includes('Admin'))
    );
  }

  ngOnInit(): void {
    const routeSub = this.route.paramMap.subscribe(params => {
      this.moduleId = params.get('id')!;

      this.showGradeSubmissions = false;
      this.showViewGrades = false;
      this.showEditModuleForm = false;
      this.showParticipants = false;

      const queryParamSub = this.route.queryParamMap.subscribe(queryParams => {
        const view = queryParams.get('view');
        if (view === 'grades') {
          this.showViewGrades = true;
        }
      });
      this.subscriptions.add(queryParamSub);

      this.checkEnrolment();

      if (this.moduleId) {
        const moduleSub = this.moduleService.getModuleById(this.moduleId).subscribe({
          next: (module) => {
            this.module = module;

            const instructorSub = this.authService.currentUser$.pipe(
              map(user => user?.userId === module.moduleInstructor)
            ).subscribe(isInstructor => {
              this.isModuleInstructor = isInstructor;
              this.checkModuleAccess();
            });

            this.subscriptions.add(instructorSub);
          },
          error: (error) => console.error('Error fetching module', error),
        });
        this.subscriptions.add(moduleSub);
      }
    });

    this.subscriptions.add(routeSub);
  }

  private checkModuleAccess(): void {
    if (this.isModuleInstructor || this.isEnroled) {
      this.notificationService.ensureConnectionAndJoinModule(this.moduleId);
    }
  }

  ngOnDestroy(): void {
    if (this.moduleId) {
      this.notificationService.leaveModuleGroup(this.moduleId);
    }

    this.subscriptions.unsubscribe();
  }

  checkEnrolment(): void {
    const enrolmentSub = this.enrolmentService.isUserEnroled(this.moduleId).subscribe({
      next: (isEnroled) => {
        this.isEnroled = isEnroled;

        if (this.isModuleInstructor !== undefined) {
          this.checkModuleAccess();
        }
      },
      error: (error) => console.error('Error checking enrolment', error),
    });

    this.subscriptions.add(enrolmentSub);
  }

  payAndEnrol(): void {
    if (this.module) {
      this.isRedirectingToStripe = true;

      this.paymentService.createCheckoutSession(
        this.module.moduleName,
        this.module.price,
        this.moduleId
      ).catch(() => {
        this.isRedirectingToStripe = false;
        this.msgDialog.show('warning', DIALOG_MESSAGES.PAYMENT_ERROR);
      });
    }
  }

  editModule(): void {
    if (this.module) {
      this.showEditModuleForm = true;
      this.showParticipants = false;
      this.showViewGrades = false;
    }
  }

  deleteModule(): void {
    this.deleteDialogTitle = `Deleting '${this.module.moduleName}'`;
    this.deleteDialogMessage = DIALOG_MESSAGES.DELETE_MODULE;
    this.deleteDialog.show();
  }

  onDeleteConfirmed(confirmed: boolean): void {
    if (!confirmed) return;

    this.moduleService.deleteModule(this.moduleId).subscribe({
      next: () => {
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
    this.showEditModuleForm = false;
  }

  toggleViewParticipants(): void {
    this.showParticipants = !this.showParticipants;
    this.showViewGrades = false;
    this.showGradeSubmissions = false;
    this.showEditModuleForm = false;
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
