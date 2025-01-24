import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersModule } from './users/users.module';
import { HomeComponent } from './home/home.component';
import { ModulesModule } from './modules/modules.module';

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
