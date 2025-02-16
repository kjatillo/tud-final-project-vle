import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './features/users/components/register/register.component';
import { LoginComponent } from './features/users/components/login/login.component';
import { LogoutComponent } from './features/users/components/logout/logout.component';
import { HomeComponent } from './features/home/home.component';
import { CreateModuleComponent } from './features/modules/components/create-module/create-module.component';
import { EditModuleComponent } from './features/modules/components/edit-module/edit-module.component';
import { ExploreModulesComponent } from './features/modules/components/explore-modules/explore-modules.component';
import { ModuleDetailComponent } from './features/modules/components/module-detail/module-detail.component';
import { UploadLectureNoteComponent } from './features/modules/components/upload-lecture-note/upload-lecture-note.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'logout', component: LogoutComponent },
  { path: 'create-module', component: CreateModuleComponent },
  { path: 'module/:id', component: ModuleDetailComponent },
  { path: 'module/:id/edit', component: EditModuleComponent },
  { path: 'explore', component: ExploreModulesComponent },
  { path: 'module/:id/upload-lecture-note', component: UploadLectureNoteComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
