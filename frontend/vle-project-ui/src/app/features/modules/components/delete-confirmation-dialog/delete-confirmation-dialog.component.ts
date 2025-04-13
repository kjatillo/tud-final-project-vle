import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-delete-confirmation-dialog',
  templateUrl: './delete-confirmation-dialog.component.html',
  styleUrls: ['./delete-confirmation-dialog.component.scss']
})
export class DeleteConfirmationDialogComponent {
  @ViewChild('deleteModal') modal!: ElementRef;
  @Input() title: string = '';
  @Input() message: string = '';
  @Output() confirmed = new EventEmitter<boolean>();

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

  onConfirm(): void {
    this.confirmed.emit(true);
    this.hide();
  }

  onCancel(): void {
    this.confirmed.emit(false);
    this.hide();
  }
}