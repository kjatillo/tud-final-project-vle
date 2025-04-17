import { Component, ElementRef, Input, ViewChild } from '@angular/core';

type MessageType = 'success' | 'info' | 'warning';

@Component({
  selector: 'app-message-dialog',
  templateUrl: './message-dialog.component.html',
  styleUrls: ['./message-dialog.component.scss']
})
export class MessageDialogComponent {
  @ViewChild('messageModal') modal!: ElementRef;
  @Input() message: string = '';
  @Input() type: MessageType = 'success';

  private bootstrapModal: any;

  ngAfterViewInit() {
    // @ts-ignore
    this.bootstrapModal = new bootstrap.Modal(this.modal.nativeElement);
  }

  show(customType?: MessageType, customMessage?: string) {
    if (customMessage) {
      this.message = customMessage;
    }
    if (customType) {
      this.type = customType;
    }
    this.bootstrapModal.show();
  }

  hide() {
    this.bootstrapModal.hide();
  }

  get iconClass() {
    switch (this.type) {
      case 'success': return 'bi bi-check-circle-fill text-success';
      case 'info': return 'bi bi-exclamation-circle-fill text-primary';
      case 'warning': return 'bi bi-exclamation-triangle-fill text-warning';
      default: return '';
    }
  }
}