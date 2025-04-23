import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';  // Import Router for navigation
import { AuthService } from '../auth.service';
import { AuthCookieService } from '../../../core/services/auth-cookie.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit{
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,  // Inject AuthService
    private router: Router,  // Inject Router
    private cookieService: AuthCookieService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)]],
      rememberMe: [false]
    });
  }
  ngOnInit(){
     if(!!this.cookieService.getEmail() && !!this.cookieService.getPassword()){
      this.authService.login(this.cookieService.getEmail() || '', this.cookieService.getPassword() || '', true).subscribe({
        next: (response) => {
          console.log('Login successful:', response);
          this.router.navigate(['/entreprise']);
        },
        error: (error) => {
          alert(error.error ? error.error : 'An error occurred during login');
        }
      });
    }
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { email, password, rememberMe } = this.loginForm.value;

      this.authService.login(email, password, rememberMe).subscribe({
        next: (response) => {
          console.log('Login successful:', response);
          if (rememberMe) {
            localStorage.setItem('email', email);
          }
          this.router.navigate(['/entreprise']);
        },
        error: (error) => {
          alert(error.error ? error.error : 'An error occurred during login');
        }
      });
    } else {
      console.log('Form is invalid');
    }
  }
}
