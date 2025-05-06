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
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { InputNumberModule } from 'primeng/inputnumber';




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
    InputNumberModule

    
  ],
  providers: [provideAnimations(), provideHttpClient(
    withInterceptors([authInterceptorInterceptor])
  ),  provideHttpClient(
    withInterceptors([authInterceptorInterceptor, messageInterceptorInterceptor])  // Add messageInterceptor here
  ),MessageService],
  bootstrap: [AppComponent]
})
export class AppModule { }
