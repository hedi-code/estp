import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: false,
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {
  resetForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router, private authService: AuthService) {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit(): void {
   
  }

  onSubmit(): void {
    if (this.resetForm.valid) {
      const email = this.resetForm.value.email;
      this.authService.resetPasswordRequest(email).subscribe({
        next: (response) => { console.log("Request sent")},
        error: (err) => console.error(JSON.stringify(err))
      })
      this.router.navigate(['/login']);
    } else {
      this.resetForm.markAllAsTouched();
    }
  }
}
