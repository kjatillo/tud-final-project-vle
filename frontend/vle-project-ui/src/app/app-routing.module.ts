import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './features/users/components/register/register.component';
import { LoginComponent } from './features/users/components/login/login.component';
import { LogoutComponent } from './features/users/components/logout/logout.component';
import { HomeComponent } from './features/home/home.component';
import { CreateModuleComponent } from './features/modules/components/create-module/create-module.component';
import { ModuleDetailComponent } from './features/modules/components/module-detail/module-detail.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'logout', component: LogoutComponent },
  { path: 'create-module', component: CreateModuleComponent },
  { path: 'module/:id', component: ModuleDetailComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
