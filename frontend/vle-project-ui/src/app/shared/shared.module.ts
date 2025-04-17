import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DeleteConfirmationDialogComponent } from './components/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { FooterComponent } from './components/footer/footer.component';
import { MessageDialogComponent } from './components/message-dialog/message-dialog.component';
import { NavbarComponent } from './components/navbar/navbar.component';

@NgModule({
  declarations: [
    DeleteConfirmationDialogComponent,
    FooterComponent,
    MessageDialogComponent,
    NavbarComponent
  ],
  imports: [
    CommonModule,
    MatProgressSpinnerModule
  ],
  exports: [
    DeleteConfirmationDialogComponent,
    FooterComponent,
    MessageDialogComponent,
    NavbarComponent
  ]
})
export class SharedModule { }
