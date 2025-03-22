import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HomeComponent } from './home/home.component';
import { ModulesModule } from './modules/modules.module';
import { UsersModule } from './users/users.module';
import { PaymentModule } from './payment/payment.module';

@NgModule({
  declarations: [
    HomeComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    HomeComponent,
    ModulesModule,
    UsersModule,
    PaymentModule
  ]
})
export class FeaturesModule { }
