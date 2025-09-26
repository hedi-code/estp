import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { ResetPasswordComponent } from './features/auth/reset-password/reset-password.component';

// PrimeNG Modules
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageModule } from 'primeng/message';
import { MessagesModule } from 'primeng/messages';
import { ReactiveFormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TabViewModule } from 'primeng/tabview';
import { IntroductionComponent } from './features/entreprise/introduction/introduction.component';
import { VotreEntrepriseComponent } from './features/entreprise/votre-entreprise/votre-entreprise.component';
import { Bc1Component } from './features/entreprise/bc1/bc1.component';
import { Bc2Component } from './features/entreprise/bc2/bc2.component';
import { EntrepriseComponent } from './features/entreprise/entreprise.component';
import { RecapitulatifComponent } from './features/entreprise/recapitulatif/recapitulatif.component';
import { StepperModule } from 'primeng/stepper';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TableModule } from 'primeng/table';
import { PanelModule } from 'primeng/panel';
import { provideAnimations } from '@angular/platform-browser/animations';
import { CommandeComponent } from './features/entreprise/commande/commande.component';
import { VerifyAcccountComponent } from './features/auth/verify-acccount/verify-acccount.component';
import { HttpClient, HttpClientModule, provideHttpClient, withInterceptors } from '@angular/common/http';
import { ValidatePasswordComponent } from './features/auth/validate-password/validate-password.component';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { authInterceptorInterceptor } from './core/interceptors/auth-interceptor.interceptor';
import { messageInterceptorInterceptor } from './core/interceptors/message-interceptor.interceptor';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { InputNumberModule } from 'primeng/inputnumber';
import { AccordionModule } from 'primeng/accordion';
import { DialogModule } from 'primeng/dialog';
import { FactureBc1Component } from './features/entreprise/bc1/facture-bc1/facture-bc1.component';
import { FactureBc2Component } from './features/entreprise/bc2/facture-bc2/facture-bc2.component';
import { apiInterceptorProvider } from './core/interceptors/api.interceptor';
import { LoaderComponent } from './core/components/loader/loader.component';
import { MenuitemComponent } from './features/forum/components/menuitem/menuitem.component';
import { MenuComponent } from './features/forum/components/menu/menu.component';
import { LayoutComponent } from './features/forum/layout/layout.component';
import { ToBeDevelopedComponent } from './features/forum/components/to-be-developed/to-be-developed.component';
import { EntrepriseSouscritesComponent } from './features/forum/components/entreprise-souscrites/entreprise-souscrites.component';
import { Bc1SouscritsComponent } from './features/forum/components/bc1-souscrits/bc1-souscrits.component';
import { Bc2SouscritsComponent } from './features/forum/components/bc2-souscrits/bc2-souscrits.component';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { Bc1SouscritFactureComponent } from './features/forum/components/bc1-souscrits/bc1-souscrit-facture/bc1-souscrit-facture.component';
import { DecimalPipe } from '@angular/common';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { GestionBc1Component } from './features/forum/components/gestion-bc1/gestion-bc1.component';
import { GestionBc2Component } from './features/forum/components/gestion-bc2/gestion-bc2.component';
import { GestionBookComponent } from './features/forum/components/gestion-book/gestion-book.component';
import { DashboardComponent } from './features/forum/components/dashboard/dashboard.component';
import { provideCharts, withDefaultRegisterables, BaseChartDirective } from 'ng2-charts';




@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    ResetPasswordComponent,
    IntroductionComponent,
    VotreEntrepriseComponent,
    Bc1Component,
    Bc2Component,
    EntrepriseComponent,
    RecapitulatifComponent,
    CommandeComponent,
    VerifyAcccountComponent,
    ValidatePasswordComponent,
    FactureBc1Component,
    FactureBc2Component,
    LoaderComponent,
    MenuitemComponent,
    MenuComponent,
    LayoutComponent,
    ToBeDevelopedComponent,
    EntrepriseSouscritesComponent,
    Bc1SouscritsComponent,
    Bc2SouscritsComponent,
    Bc1SouscritFactureComponent,
    GestionBc1Component,
    GestionBc2Component,
    GestionBookComponent,
    DashboardComponent,
    ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    InputTextModule,  // PrimeNG input text
    ButtonModule,     // PrimeNG button
    CheckboxModule,   // PrimeNG checkbox
    MessageModule,    // PrimeNG message (for form validation errors)
    MessagesModule ,
    ReactiveFormsModule,
    TabViewModule,
    CardModule,
    StepperModule,
    SelectButtonModule,
    TableModule,
    PanelModule,
    DropdownModule,
    HttpClientModule,
    ToastModule,
    InputNumberModule,
    DialogModule,
    TableModule,
    TagModule,
    ConfirmDialogModule,
    ToolbarModule,
    TooltipModule,
    ConfirmPopupModule,
    FileUploadModule,
    InputTextareaModule,
    AccordionModule,
    BaseChartDirective
  ],
  providers: [
    provideAnimations(),
    apiInterceptorProvider,
    DecimalPipe,
    provideHttpClient(withInterceptors([authInterceptorInterceptor])),
    provideHttpClient(withInterceptors([authInterceptorInterceptor, messageInterceptorInterceptor])),
    MessageService,
    ConfirmationService,
    provideCharts(withDefaultRegisterables())
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
