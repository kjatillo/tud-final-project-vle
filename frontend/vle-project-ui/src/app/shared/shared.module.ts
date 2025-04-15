import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DeleteConfirmationDialogComponent } from './components/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { FooterComponent } from './components/footer/footer.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SuccessConfirmationDialogComponent } from './components/success-confirmation-dialog/success-confirmation-dialog.component';

@NgModule({
  declarations: [
    DeleteConfirmationDialogComponent,
    FooterComponent,
    NavbarComponent,
    SuccessConfirmationDialogComponent
  ],
  imports: [
    CommonModule,
    MatProgressSpinnerModule
  ],
  exports: [
    DeleteConfirmationDialogComponent,
    FooterComponent,
    NavbarComponent,
    SuccessConfirmationDialogComponent
  ]
})
export class SharedModule { }
