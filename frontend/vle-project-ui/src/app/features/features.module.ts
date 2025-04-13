import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DashboardsModule } from './dashboards/dashboards.module';
import { HomeComponent } from './home/home.component';
import { ModulesModule } from './modules/modules.module';
import { PaymentModule } from './payment/payment.module';
import { UsersModule } from './users/users.module';

@NgModule({
  declarations: [
    HomeComponent
  ],
  imports: [
    CommonModule,
    DashboardsModule,
    MatProgressSpinnerModule,
  ],
  exports: [
    DashboardsModule,
    HomeComponent,
    ModulesModule,
    UsersModule,
    PaymentModule,
  ]
})
export class FeaturesModule { }
