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

@NgModule({
  declarations: [
    CreateModuleComponent,
    DeleteConfirmationDialogComponent,
    ModuleDetailComponent,
    EditModuleComponent,
    ExploreModulesComponent,
    UploadLectureNoteComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    ReactiveFormsModule
  ],
  exports: [
    CreateModuleComponent,
    DeleteConfirmationDialogComponent,
    ModuleDetailComponent,
    EditModuleComponent,
    ExploreModulesComponent,
    UploadLectureNoteComponent
  ]
})
export class ModulesModule { }
