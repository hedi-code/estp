import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { ResetPasswordComponent } from './features/auth/reset-password/reset-password.component';
import { EntrepriseComponent } from './features/entreprise/entreprise.component';
import { IntroductionComponent } from './features/entreprise/introduction/introduction.component';
import { Bc1Component } from './features/entreprise/bc1/bc1.component';
import { Bc2Component } from './features/entreprise/bc2/bc2.component';
import { RecapitulatifComponent } from './features/entreprise/recapitulatif/recapitulatif.component';
import { VotreEntrepriseComponent } from './features/entreprise/votre-entreprise/votre-entreprise.component';
import { VerifyAcccountComponent } from './features/auth/verify-acccount/verify-acccount.component';
import { ValidatePasswordComponent } from './features/auth/validate-password/validate-password.component';
import { LayoutComponent } from './features/forum/layout/layout.component';
import { EntrepriseSouscritesComponent } from './features/forum/components/entreprise-souscrites/entreprise-souscrites.component';
import { Bc1SouscritsComponent } from './features/forum/components/bc1-souscrits/bc1-souscrits.component';
import { Bc2SouscritsComponent } from './features/forum/components/bc2-souscrits/bc2-souscrits.component';
import { GestionBc1Component } from './features/forum/components/gestion-bc1/gestion-bc1.component';
import { GestionBc2Component } from './features/forum/components/gestion-bc2/gestion-bc2.component';
import { GestionBookComponent } from './features/forum/components/gestion-book/gestion-book.component';
import { GestionPlanComponent } from './features/forum/components/gestion-plan/gestion-plan.component';
import { DashboardComponent } from './features/forum/components/dashboard/dashboard.component';
import { MailingComponent } from './features/forum/components/mailing/mailing.component';
import { StandisteComponent } from './features/forum/components/standiste/standiste.component';
import { GestionExposantsComponent } from './features/forum/components/gestion-exposants/gestion-exposants.component';
import { RoleGuard } from './core/guards/role.guard';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'reset', component: ResetPasswordComponent },
  { path: 'auth/verify/:token', component: VerifyAcccountComponent },
  { path: 'auth/reset-password', component: ResetPasswordComponent },
  { path: 'auth/validate-password/:token', component: ValidatePasswordComponent },
  {
    path: 'entreprise', 
    component: EntrepriseComponent,
    children: [
      { path: '', component: IntroductionComponent },
      { path: 'votre-entreprise', component: VotreEntrepriseComponent },
      { path: 'bc1', component: Bc1Component },
      { path: 'bc2', component: Bc2Component },
      { path: 'recap', component: RecapitulatifComponent },
    ]
  },
  {
    path: 'forum',
    component: LayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent, canActivate: [RoleGuard], data: { roles: ['tres', 'pres', 'comm'] } },
      { path: 'entreprise', component: EntrepriseSouscritesComponent, canActivate: [RoleGuard], data: { roles: ['rescom', 'pres', 'comm', 'tres'] } },
      { path: 'bc1', component: Bc1SouscritsComponent, canActivate: [RoleGuard], data: { roles: ['rescom', 'pres', 'comm', 'tres'] } },
      { path: 'bc2', component: Bc2SouscritsComponent, canActivate: [RoleGuard], data: { roles: ['rescom', 'pres', 'comm', 'tres'] } },
      { path: 'gestion-bc1', component: GestionBc1Component, canActivate: [RoleGuard], data: { roles: ['pres'] } },
      { path: 'gestion-bc2', component: GestionBc2Component, canActivate: [RoleGuard], data: { roles: ['pres'] } },
      { path: 'gestion-book', component: GestionBookComponent, canActivate: [RoleGuard], data: { roles: ['resbook', 'pres'] } },
      { path: 'gestion-plan', component: GestionPlanComponent, canActivate: [RoleGuard], data: { roles: ['resplan', 'pres'] } },
      { path: 'mailing', component: MailingComponent, canActivate: [RoleGuard], data: { roles: ['pres','rescommu','comman','pres','rescom'] } },
      { path: 'standiste', component: StandisteComponent, canActivate: [RoleGuard], data: { roles: ['pres'] } },
      { path: 'gestion-exposants', component: GestionExposantsComponent, canActivate: [RoleGuard], data: { roles: ['pres'] } },
    ]
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
