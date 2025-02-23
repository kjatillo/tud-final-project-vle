import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { AddContentComponent } from './features/modules/components/add-content/add-content.component';
import { CreateModuleComponent } from './features/modules/components/create-module/create-module.component';
import { EditModuleComponent } from './features/modules/components/edit-module/edit-module.component';
import { ExploreModulesComponent } from './features/modules/components/explore-modules/explore-modules.component';
import { ModuleDetailComponent } from './features/modules/components/module-detail/module-detail.component';
import { ModulePageComponent } from './features/modules/components/module-page/module-page.component';
import { LoginComponent } from './features/users/components/login/login.component';
import { LogoutComponent } from './features/users/components/logout/logout.component';
import { RegisterComponent } from './features/users/components/register/register.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'logout', component: LogoutComponent },
  { path: 'create-module', component: CreateModuleComponent },
  { path: 'module/:id', component: ModuleDetailComponent, children: [
    { path: 'page/:pageId', component: ModulePageComponent, children: [
      { path: 'add-content', component: AddContentComponent },
    ]}
  ]},
  { path: 'module/:id/edit', component: EditModuleComponent },
  { path: 'explore', component: ExploreModulesComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
