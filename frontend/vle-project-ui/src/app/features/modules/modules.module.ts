import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CreateModuleComponent } from './components/create-module/create-module.component';

@NgModule({
  declarations: [
    CreateModuleComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    CreateModuleComponent
  ]
})
export class ModulesModule { }
