import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-feedback-dialog',
  templateUrl: './feedback-dialog.component.html',
  styleUrls: ['./feedback-dialog.component.scss']
})
export class FeedbackDialogComponent {
  isInstructor!: boolean;

  constructor(
    private authService: AuthService,
    public dialogRef: MatDialogRef<FeedbackDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { feedback: string }
  ) { }

  ngOnInit(): void {
    this.authService.userRoles$.subscribe(roles => {
      this.isInstructor = roles.includes('Instructor');
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}