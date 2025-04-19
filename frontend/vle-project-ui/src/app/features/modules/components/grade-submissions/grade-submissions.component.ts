import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import * as XLSX from 'xlsx';
import { AuthService } from '../../../../core/services/auth.service';
import { MessageDialogComponent } from '../../../../shared/components/message-dialog/message-dialog.component';
import { DIALOG_MESSAGES } from '../../../../shared/constants/dialog-messages';
import { NotificationService } from '../../../../shared/services/notification.service';
import { ModuleAssignment } from '../../models/module-assignment.model';
import { ModuleSubmission } from '../../models/module-submission.model';
import { AssignmentService } from '../../services/assignment.service';
import { ModuleService } from '../../services/module.service';
import { FeedbackDialogComponent } from '../feedback-dialog/feedback-dialog.component';

@Component({
  selector: 'app-grade-submissions',
  templateUrl: './grade-submissions.component.html',
  styleUrls: ['./grade-submissions.component.scss']
})
export class GradeSubmissionsComponent implements OnInit {
  @ViewChild('feedbackDialog') feedbackDialog!: FeedbackDialogComponent;
  @ViewChild('msgDialog') msgDialog!: MessageDialogComponent;
  @Output() backToModuleDetails = new EventEmitter<void>();
  isAuthResolved$: Observable<boolean>;
  gradeForm!: FormGroup;
  moduleId!: string;
  moduleTitle: string = '';
  selectedContentId!: string;
  isModuleInstructor!: boolean;
  submissions: ModuleSubmission[] = [];
  filteredSubmissions: ModuleSubmission[] = [];
  displayedSubmissions: ModuleSubmission[] = [];
  assignments: ModuleAssignment[] = [];
  currentFeedback: string = '';
  currentSubmissionId: string = '';
  searchQuery: string = '';
  isLoadingSubmissions: boolean = false;
  isSendingNotification: boolean = false;
  isDragOver: boolean = false;

  pageSize = 5;
  pageSizeOptions = [5, 10, 25];
  pageIndex = 0;

  constructor(
    private authService: AuthService,
    private assignmentService: AssignmentService,
    private moduleService: ModuleService,
    private notificationService: NotificationService,
    private fb: FormBuilder,
    private route: ActivatedRoute
  ) {
    this.isAuthResolved$ = this.authService.isAuthResolved;
  }

  ngOnInit(): void {
    this.isLoadingSubmissions = true;

    this.gradeForm = this.fb.group({
      contentId: ['']
    });

    this.moduleId = this.route.snapshot.paramMap.get('id')!;

    this.moduleService.getModuleById(this.moduleId).subscribe(module => {
      this.moduleTitle = module.moduleName;
    });

    this.assignmentService.getModuleAssignments(this.moduleId).subscribe(assignments => {
      this.assignments = assignments;
    });

    this.gradeForm.get('contentId')?.valueChanges.subscribe(contentId => {
      this.selectedContentId = contentId;
      this.searchQuery = '';
      this.loadSubmissions(contentId);
    });
  }

  loadSubmissions(contentId: string): void {
    this.submissions = [];

    this.assignmentService.getGrades(contentId).subscribe({
      next: (submissions) => {
        this.submissions = submissions.map((submission: { grade: number; }) => ({
          ...submission,
          originalGrade: submission.grade,
          isGradeChanged: false
        }));
        this.filteredSubmissions = [...this.submissions];
        this.updateDisplayedSubmissions();

        this.isLoadingSubmissions = false;
      },
      error: () => {
        this.isLoadingSubmissions = false;
      }
    });
  }

  onSearch(): void {
    this.filteredSubmissions = this.submissions.filter(submission =>
      submission.firstName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      submission.lastName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      submission.userEmail.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
    this.pageIndex = 0;
    this.updateDisplayedSubmissions();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updateDisplayedSubmissions();
  }

  private updateDisplayedSubmissions(): void {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.displayedSubmissions = this.filteredSubmissions.slice(start, end);
  }

  updateGrade(submissionId: string, grade: number, feedback: string): void {
    this.assignmentService.updateGrade(submissionId, { grade, feedback }).subscribe(() => {
      this.loadSubmissions(this.selectedContentId);
    });
  }

  onGradeChange(submission: ModuleSubmission): void {
    submission.isGradeChanged = submission.grade !== submission.originalGrade;
  }

  removeGrade(submissionId: string): void {
    this.assignmentService.deleteGrade(submissionId).subscribe(() => {
      this.loadSubmissions(this.selectedContentId);
    });
  }

  openFeedbackDialog(submission: ModuleSubmission): void {
    this.currentFeedback = submission.feedback;
    this.currentSubmissionId = submission.submissionId;
    this.feedbackDialog.show();
  }

  onFeedbackSave(feedback: string): void {
    if (this.currentSubmissionId) {
      const submission = this.submissions.find(s => s.submissionId === this.currentSubmissionId);
      if (submission) {
        submission.feedback = feedback;
        this.updateGrade(submission.submissionId, submission.grade, feedback);
      }
    }
  }

  onBackToModuleDetail(): void {
    this.backToModuleDetails.emit();
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.processFile(event.dataTransfer.files[0]);
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.processFile(file);
    }
  }

  private processFile(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rows: any[] = XLSX.utils.sheet_to_json(worksheet);

        let updatedGradeList: Observable<any>[] = [];

        rows.forEach((row) => {
          const email = (row.Email || row.email)?.toString().trim();
          const grade = typeof (row.Grade || row.grade) === 'number' ? (row.Grade || row.grade) :
            typeof (row.Grade || row.grade) === 'string' ? parseFloat(row.Grade || row.grade) :
              null;
          const feedback = (row.Feedback || row.feedback)?.toString().trim();

          const submission = this.submissions.find(s =>
            s.userEmail.toLowerCase() === email.toLowerCase()
          );

          if (submission) {
            let isFeedbackChanged: boolean = false;
            const normalisedGrade = Math.min(Math.max(grade, 0), 100);
            submission.grade = normalisedGrade;
            submission.isGradeChanged = normalisedGrade !== submission.originalGrade;

            if (feedback && feedback.trim() !== submission.feedback) {
              submission.feedback = feedback.trim();
              isFeedbackChanged = true;
            }

            if (submission.isGradeChanged || isFeedbackChanged) {
              const gradeUpdate = this.assignmentService.updateGrade(
                submission.submissionId,
                { grade: normalisedGrade, feedback: submission.feedback }
              );

              updatedGradeList.push(gradeUpdate);
            }
          }
        });

        if (updatedGradeList.length > 0) {
          forkJoin(updatedGradeList).subscribe({
            next: () => {
              this.loadSubmissions(this.selectedContentId);

              this.msgDialog.show('success', DIALOG_MESSAGES.GRADE_UPDATE_SUCCESS);
            },
            error: () => {
              this.msgDialog.show('warning', DIALOG_MESSAGES.GRADE_UPDATE_FAILED);
            }
          });
        } else {
          this.msgDialog.show('info', DIALOG_MESSAGES.GRADE_NO_CHANGES);
        }
      } catch (error) {
        this.msgDialog.show('warning', DIALOG_MESSAGES.GRADE_PROCESSING_ERROR);
      }
    };
    reader.readAsArrayBuffer(file);
  }

  sendGradeNotification(): void {
    if (!this.moduleId || !this.moduleTitle) {
      this.msgDialog.show('warning', DIALOG_MESSAGES.GRADE_NOTIFY_NO_MODULE);
      return;
    }

    this.isSendingNotification = true;
    const message = 'Grades and feedback updated. Visit the Grades page to view your results.';

    this.notificationService.sendGradeNotification(this.moduleId, message, this.moduleTitle)
      .subscribe({
        next: (success) => {
          this.isSendingNotification = false;
          if (success) {
            this.msgDialog.show('success', DIALOG_MESSAGES.GRADE_NOTIFY_SUCCESS);
          } else {
            this.msgDialog.show('warning', DIALOG_MESSAGES.GRADE_NOTIFY_FAIL);
          }
        },
        error: (err) => {
          console.error('Error sending notification:', err);
          this.isSendingNotification = false;
          this.msgDialog.show('warning', DIALOG_MESSAGES.GRADE_NOTIFY_FAIL);
        }
      });
  }
}
