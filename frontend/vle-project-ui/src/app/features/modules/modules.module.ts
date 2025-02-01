import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CreateModuleComponent } from './components/create-module/create-module.component';
import { EditModuleComponent } from './components/edit-module/edit-module.component';
import { ModuleDetailComponent } from './components/module-detail/module-detail.component';

@NgModule({
  declarations: [
    CreateModuleComponent,
    ModuleDetailComponent,
    EditModuleComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    CreateModuleComponent,
    ModuleDetailComponent,
    EditModuleComponent
  ]
})
export class ModulesModule { }
