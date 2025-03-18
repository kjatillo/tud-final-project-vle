import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AssignmentService } from '../../services/assignment.service';
import { FeedbackDialogComponent } from '../feedback-dialog/feedback-dialog.component';
import { AuthService } from '../../../../core/services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { ModuleSubmission } from '../../models/module-submission.model';
import { ModuleAssignment } from '../../models/module-assignment.model';

@Component({
  selector: 'app-grade-submissions',
  templateUrl: './grade-submissions.component.html',
  styleUrls: ['./grade-submissions.component.scss']
})
export class GradeSubmissionsComponent implements OnInit {
  gradeForm!: FormGroup;
  submissions: ModuleSubmission[] = [];
  assignments: ModuleAssignment[] = [];
  selectedContentId!: string;
  moduleId!: string;
  isInstructor!: boolean;

  constructor(
    private assignmentService: AssignmentService,
    private authService: AuthService,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.gradeForm = this.fb.group({
      contentId: ['']
    });

    this.moduleId = this.route.snapshot.paramMap.get('id')!;

    this.authService.userRoles$.subscribe(roles => {
      this.isInstructor = roles.includes('Instructor');
    });

    this.assignmentService.getModuleAssignments(this.moduleId).subscribe(assignments => {
      this.assignments = assignments;
    })

    this.gradeForm.get('contentId')?.valueChanges.subscribe(contentId => {
      this.selectedContentId = contentId;
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
    });
  }

  updateGrade(submissionId: string, grade: number, feedback: string): void {
    this.assignmentService.updateGrade(submissionId, { grade, feedback }).subscribe(() => {
      this.loadSubmissions(this.selectedContentId);
    });
  }

  removeGrade(submissionId: string): void {
    this.assignmentService.deleteGrade(submissionId).subscribe(() => {
      this.loadSubmissions(this.selectedContentId);
    });
  }

  openFeedbackDialog(submission: ModuleSubmission): void {
    const dialogRef = this.dialog.open(FeedbackDialogComponent, {
      width: '400px',
      data: { feedback: submission.feedback }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        submission.feedback = result;
        this.updateGrade(submission.submissionId, submission.grade, submission.feedback);
      }
    });
  }

  onGradeChange(submission: ModuleSubmission): void {
    submission.isGradeChanged = submission.grade !== submission.originalGrade;
  }
}