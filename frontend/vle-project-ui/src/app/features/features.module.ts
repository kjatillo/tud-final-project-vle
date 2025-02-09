import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HomeComponent } from './home/home.component';
import { ModulesModule } from './modules/modules.module';
import { UsersModule } from './users/users.module';

@NgModule({
  declarations: [
    HomeComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    HomeComponent,
    UsersModule,
    ModulesModule,
  ]
})
export class FeaturesModule { }
