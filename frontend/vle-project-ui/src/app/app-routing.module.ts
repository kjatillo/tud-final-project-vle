import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { CreateModuleComponent } from './features/modules/components/create-module/create-module.component';
import { EditModuleComponent } from './features/modules/components/edit-module/edit-module.component';
import { ExploreModulesComponent } from './features/modules/components/explore-modules/explore-modules.component';
import { ModuleDetailComponent } from './features/modules/components/module-detail/module-detail.component';
import { PaymentCancelComponent } from './features/payment/components/payment-cancel/payment-cancel.component';
import { PaymentSuccessComponent } from './features/payment/components/payment-success/payment-success.component';
import { LoginComponent } from './features/users/components/login/login.component';
import { LogoutComponent } from './features/users/components/logout/logout.component';
import { RegisterComponent } from './features/users/components/register/register.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'logout', component: LogoutComponent },
  { path: 'create-module', component: CreateModuleComponent },
  { path: 'module/:id', component: ModuleDetailComponent},
  { path: 'module/:id/edit', component: EditModuleComponent },
  { path: 'explore', component: ExploreModulesComponent },
  { path: 'payment-cancel', component: PaymentCancelComponent },
  { path: 'payment-success', component: PaymentSuccessComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
