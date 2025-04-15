import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModuleSubmission } from '../../models/module-submission.model';
import { AssignmentService } from '../../services/assignment.service';
import { FeedbackDialogComponent } from '../feedback-dialog/feedback-dialog.component';

@Component({
  selector: 'app-view-grades',
  templateUrl: './view-grades.component.html',
  styleUrls: ['./view-grades.component.scss']
})
export class ViewGradesComponent implements OnInit {
  @ViewChild('feedbackDialog') feedbackDialog!: FeedbackDialogComponent;
  @Output() backToModuleDetails = new EventEmitter<void>();
  submissions: ModuleSubmission[] = [];
  moduleId!: string;
  currentFeedback: string = '';
  currentSubmissionId: string = '';

  constructor(
    private assignmentService: AssignmentService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.moduleId = this.route.snapshot.paramMap.get('id')!;

    this.loadSubmissions();
  }

  loadSubmissions(): void {
    this.assignmentService.getStudentSubmissions(this.moduleId).subscribe(submissions => {
      this.submissions = submissions.sort((a: ModuleSubmission, b: ModuleSubmission) => {
        return a.contentTitle.localeCompare(b.contentTitle);
      });
    });
  }

  openFeedbackDialog(submission: ModuleSubmission): void {
    this.currentFeedback = submission.feedback;
    this.feedbackDialog.show();
  }

  onBackToModuleDetail(): void {
    this.backToModuleDetails.emit();
  }
}
