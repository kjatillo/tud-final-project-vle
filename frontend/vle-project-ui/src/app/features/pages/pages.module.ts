import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ContactComponent } from './components/contact/contact.component';
import { HomeComponent } from './components/home/home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DashboardsModule } from '../dashboards/dashboards.module';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    ContactComponent,
    HomeComponent
  ],
  imports: [
    CommonModule,
    DashboardsModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    MatProgressSpinnerModule
  ],
  exports: [
    ContactComponent,
    HomeComponent
  ]
})
export class PagesModule { }
