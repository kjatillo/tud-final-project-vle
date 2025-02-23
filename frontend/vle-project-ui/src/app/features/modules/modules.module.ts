import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { AddContentComponent } from './components/add-content/add-content.component';
import { AddPageComponent } from './components/add-page/add-page.component';
import { CreateModuleComponent } from './components/create-module/create-module.component';
import { DeleteConfirmationDialogComponent } from './components/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { EditContentComponent } from './components/edit-content/edit-content.component';
import { EditModuleComponent } from './components/edit-module/edit-module.component';
import { ExploreModulesComponent } from './components/explore-modules/explore-modules.component';
import { ModuleDetailComponent } from './components/module-detail/module-detail.component';
import { ModulePageComponent } from './components/module-page/module-page.component';

@NgModule({
  declarations: [
    AddContentComponent,
    AddPageComponent,
    CreateModuleComponent,
    DeleteConfirmationDialogComponent,
    EditContentComponent,
    EditModuleComponent,
    ExploreModulesComponent,
    ModuleDetailComponent,
    ModulePageComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    ReactiveFormsModule,
    RouterModule
  ],
  exports: [
    AddContentComponent,
    AddPageComponent,
    CreateModuleComponent,
    DeleteConfirmationDialogComponent,
    EditContentComponent,
    EditModuleComponent,
    ExploreModulesComponent,
    ModuleDetailComponent,
    ModulePageComponent,
  ]
})
export class ModulesModule { }
