import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AssignmentService } from '../../services/assignment.service';
import { FeedbackDialogComponent } from '../feedback-dialog/feedback-dialog.component';
import { ActivatedRoute } from '@angular/router';
import { ModuleSubmission } from '../../models/module-submission.model';

@Component({
  selector: 'app-view-grades',
  templateUrl: './view-grades.component.html',
  styleUrls: ['./view-grades.component.scss']
})
export class ViewGradesComponent implements OnInit {
  submissions: ModuleSubmission[] = [];
  moduleId!: string;

  constructor(
    private assignmentService: AssignmentService,
    public dialog: MatDialog,
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

  openFeedbackDialog(feedback: string): void {
    this.dialog.open(FeedbackDialogComponent, {
      width: '400px',
      data: { feedback }
    });
  }
}