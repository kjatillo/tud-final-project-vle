import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CreateModuleComponent } from './components/create-module/create-module.component';
import { EditModuleComponent } from './components/edit-module/edit-module.component';
import { ExploreModulesComponent } from './components/explore-modules/explore-modules.component';
import { ModuleDetailComponent } from './components/module-detail/module-detail.component';

@NgModule({
  declarations: [
    CreateModuleComponent,
    ModuleDetailComponent,
    EditModuleComponent,
    ExploreModulesComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    CreateModuleComponent,
    ModuleDetailComponent,
    EditModuleComponent,
    ExploreModulesComponent
  ]
})
export class ModulesModule { }
