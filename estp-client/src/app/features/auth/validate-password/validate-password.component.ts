import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-validate-password',
  templateUrl: './validate-password.component.html',
  styleUrl: './validate-password.component.scss',
  standalone: false
})
export class ValidatePasswordComponent implements OnInit {
  resetForm: FormGroup;
  token: string = '';
  submitted = false;
  error: string = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    this.resetForm = this.fb.group({
      newPassword: ['', [
        Validators.required,
        Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&;])[A-Za-z\d@$!%*?&;]{8,}$/)
      ]],
      newPassword2: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.token = params['token'] || '';
    });    console.log("token === "+this.token);
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('newPassword')?.value === form.get('newPassword2')?.value
      ? null : { mismatch: true };
  }

  onSubmit() {
    this.submitted = true;

    if (this.resetForm.invalid) return;

    const newPassword = this.resetForm.value.newPassword;

    this.authService.resetPassword(this.token, newPassword).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: err => {
        this.error = err.error?.message || 'Erreur de réinitialisation';
      }
    });
  }
}
