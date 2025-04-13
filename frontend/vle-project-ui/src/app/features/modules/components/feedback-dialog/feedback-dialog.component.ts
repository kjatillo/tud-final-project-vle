import { Component, ElementRef, ViewChild, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-feedback-dialog',
  templateUrl: './feedback-dialog.component.html',
  styleUrls: ['./feedback-dialog.component.scss']
})
export class FeedbackDialogComponent {
  @ViewChild('feedbackModal') modal!: ElementRef;
  @Input() isInstructor: boolean = false;
  @Input() feedback: string = '';
  @Output() feedbackChange = new EventEmitter<string>();
  @Output() save = new EventEmitter<string>();
  
  private bootstrapModal: any;

  ngAfterViewInit() {
    // @ts-ignore
    this.bootstrapModal = new bootstrap.Modal(this.modal.nativeElement);
  }

  show() {
    this.bootstrapModal.show();
  }

  hide() {
    this.bootstrapModal.hide();
  }

  onCancel(): void {
    this.hide();
  }

  onSave(): void {
    this.save.emit(this.feedback);
    this.hide();
  }
}