import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
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
  filteredSubmissions: ModuleSubmission[] = [];
  displayedSubmissions: ModuleSubmission[] = [];
  moduleId!: string;
  currentFeedback: string = '';
  currentSubmissionId: string = '';
  searchQuery: string = '';
  isLoadingSubmissions: boolean = false;
  
  pageSize = 5;
  pageSizeOptions = [5, 10, 25];
  pageIndex = 0;

  constructor(
    private assignmentService: AssignmentService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.moduleId = this.route.snapshot.paramMap.get('id')!;
    this.loadSubmissions();
  }

  loadSubmissions(): void {
    this.isLoadingSubmissions = true;

    this.assignmentService.getStudentSubmissions(this.moduleId).subscribe(submissions => {
      this.submissions = submissions.sort((a: ModuleSubmission, b: ModuleSubmission) => {
        return a.contentTitle.localeCompare(b.contentTitle);
      });
      this.filteredSubmissions = [...this.submissions];
      this.updateDisplayedSubmissions();
    });

    this.isLoadingSubmissions = false;
  }

  onSearch(): void {
    this.filteredSubmissions = this.submissions.filter(submission =>
      submission.contentTitle.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      submission.fileName.toLowerCase().includes(this.searchQuery.toLowerCase())
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

  openFeedbackDialog(submission: ModuleSubmission): void {
    this.currentFeedback = submission.feedback;
    this.feedbackDialog.show();
  }

  onBackToModuleDetail(): void {
    this.backToModuleDetails.emit();
  }
}
