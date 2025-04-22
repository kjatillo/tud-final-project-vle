import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DashboardsModule } from './dashboards/dashboards.module';
import { ModulesModule } from './modules/modules.module';
import { PaymentModule } from './payment/payment.module';
import { UsersModule } from './users/users.module';
import { PagesModule } from './pages/pages.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    DashboardsModule,
    MatProgressSpinnerModule,
  ],
  exports: [
    DashboardsModule,
    ModulesModule,
    PagesModule,
    PaymentModule,
    UsersModule,
  ]
})
export class FeaturesModule { }
