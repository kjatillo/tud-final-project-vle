import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { AddContentComponent } from './components/add-content/add-content.component';
import { AddPageComponent } from './components/add-page/add-page.component';
import { CreateModuleComponent } from './components/create-module/create-module.component';
import { EditContentComponent } from './components/edit-content/edit-content.component';
import { EditModuleComponent } from './components/edit-module/edit-module.component';
import { EditPageComponent } from './components/edit-page/edit-page.component';
import { ExploreModulesComponent } from './components/explore-modules/explore-modules.component';
import { FeedbackDialogComponent } from './components/feedback-dialog/feedback-dialog.component';
import { GradeSubmissionsComponent } from './components/grade-submissions/grade-submissions.component';
import { ModuleDetailComponent } from './components/module-detail/module-detail.component';
import { ModulePageComponent } from './components/module-page/module-page.component';
import { ModuleParticipantsComponent } from './components/module-participants/module-participants.component';
import { ViewGradesComponent } from './components/view-grades/view-grades.component';

@NgModule({
  declarations: [
    AddContentComponent,
    AddPageComponent,
    CreateModuleComponent,
    EditContentComponent,
    EditModuleComponent,
    EditPageComponent,
    ExploreModulesComponent,
    FeedbackDialogComponent,
    GradeSubmissionsComponent,
    ModuleDetailComponent,
    ModulePageComponent,
    ModuleParticipantsComponent,
    ViewGradesComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    RouterModule,
    SharedModule
  ],
  exports: [
    AddContentComponent,
    AddPageComponent,
    CreateModuleComponent,
    EditContentComponent,
    EditModuleComponent,
    EditPageComponent,
    ExploreModulesComponent,
    FeedbackDialogComponent,
    GradeSubmissionsComponent,
    ModuleDetailComponent,
    ModulePageComponent,
    ModuleParticipantsComponent,
    ViewGradesComponent
  ]
})
export class ModulesModule { }
