import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CreateModuleComponent } from './components/create-module/create-module.component';
import { DeleteConfirmationDialogComponent } from './components/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { EditModuleComponent } from './components/edit-module/edit-module.component';
import { ExploreModulesComponent } from './components/explore-modules/explore-modules.component';
import { ModuleDetailComponent } from './components/module-detail/module-detail.component';
import { UploadLectureNoteComponent } from './components/upload-lecture-note/upload-lecture-note.component';
import { ModulePageComponent } from './components/module-page/module-page.component';
import { AddPageComponent } from './components/add-page/add-page.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    AddPageComponent,
    CreateModuleComponent,
    DeleteConfirmationDialogComponent,
    EditModuleComponent,
    ExploreModulesComponent,
    ModuleDetailComponent,
    ModulePageComponent,
    UploadLectureNoteComponent,
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
    AddPageComponent,
    CreateModuleComponent,
    DeleteConfirmationDialogComponent,
    EditModuleComponent,
    ExploreModulesComponent,
    ModuleDetailComponent,
    ModulePageComponent,
    UploadLectureNoteComponent,
  ]
})
export class ModulesModule { }
