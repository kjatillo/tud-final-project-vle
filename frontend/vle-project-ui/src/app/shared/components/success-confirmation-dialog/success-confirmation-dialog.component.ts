import { Component, ElementRef, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'app-success-confirmation-dialog',
  templateUrl: './success-confirmation-dialog.component.html',
  styleUrls: ['./success-confirmation-dialog.component.scss']
})
export class SuccessConfirmationDialogComponent {
  @ViewChild('successModal') modal!: ElementRef;
  @Input() message: string = '';

  private bootstrapModal: any;

  ngAfterViewInit() {
    // @ts-ignore
    this.bootstrapModal = new bootstrap.Modal(this.modal.nativeElement);
  }

  show(customMessage?: string) {
    if (customMessage) {
      this.message = customMessage;
    }
    this.bootstrapModal.show();
  }

  hide() {
    this.bootstrapModal.hide();
  }
}
