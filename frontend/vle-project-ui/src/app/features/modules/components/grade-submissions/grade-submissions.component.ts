import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import { ModuleAssignment } from '../../models/module-assignment.model';
import { ModuleSubmission } from '../../models/module-submission.model';
import { AssignmentService } from '../../services/assignment.service';
import { FeedbackDialogComponent } from '../feedback-dialog/feedback-dialog.component';

@Component({
  selector: 'app-grade-submissions',
  templateUrl: './grade-submissions.component.html',
  styleUrls: ['./grade-submissions.component.scss']
})
export class GradeSubmissionsComponent implements OnInit {
  @ViewChild('feedbackDialog') feedbackDialog!: FeedbackDialogComponent;
  @Output() backToModuleDetails = new EventEmitter<void>();
  gradeForm!: FormGroup;
  moduleId!: string;
  selectedContentId!: string;
  isModuleInstructor!: boolean;
  submissions: ModuleSubmission[] = [];
  filteredSubmissions: ModuleSubmission[] = [];
  displayedSubmissions: ModuleSubmission[] = [];
  assignments: ModuleAssignment[] = [];
  currentFeedback: string = '';
  currentSubmissionId: string = '';
  searchQuery: string = '';
  
  pageSize = 5;
  pageSizeOptions = [5, 10, 25];
  pageIndex = 0;

  constructor(
    private assignmentService: AssignmentService,
    private fb: FormBuilder,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.gradeForm = this.fb.group({
      contentId: ['']
    });

    this.moduleId = this.route.snapshot.paramMap.get('id')!;

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

    this.assignmentService.getGrades(contentId).subscribe(submissions => {
      this.submissions = submissions.map((submission: { grade: number; }) => ({
        ...submission,
        originalGrade: submission.grade,
        isGradeChanged: false
      }));
      this.filteredSubmissions = [...this.submissions];
      this.updateDisplayedSubmissions();
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
}
