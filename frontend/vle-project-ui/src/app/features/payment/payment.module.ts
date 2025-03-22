import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentSuccessComponent } from './components/payment-success/payment-success.component';
import { PaymentCancelComponent } from './components/payment-cancel/payment-cancel.component';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    PaymentSuccessComponent,
    PaymentCancelComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],
  exports: [
    PaymentSuccessComponent,
    PaymentCancelComponent
  ]
})
export class PaymentModule { }
