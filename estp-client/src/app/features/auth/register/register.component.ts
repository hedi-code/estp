import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { EntrepriseService } from '../../entreprise/entreprise.service';
import { ContactService } from '../../forum/models/contact.service';
import { AuthService } from '../auth.service';
import { map, switchMap } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  registerForm: FormGroup;
  activeIndex: number = 0;
  labelSiren = "Numéro SIREN de l'entreprise";
  constructor(
    private fb: FormBuilder,
    private entrepriseService: EntrepriseService,
    private contactService: ContactService,
    private authService: AuthService
  ) {
    this.registerForm = this.fb.group({
      lastname: ['', Validators.required],
      firstname: ['', Validators.required],
      phonenumber: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      email: ['', [Validators.required, Validators.email]],
      companyName: ['', Validators.required],
      companySiren: ['', [Validators.required, Validators.pattern('^[0-9]{9}$')]], // Example pattern for SIREN number
      isNotInFrance: [false],
      functionInCompany: ['', Validators.required],
      password: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/)]],
      confirmPassword: ['', [Validators.required]],
    }, {
      validator: this.passwordMatcher('password', 'confirmPassword')
    });
  }

  // Custom Validator to check if password and confirmPassword match
  passwordMatcher(password: string, confirmPassword: string) {
    return (group: FormGroup) => {
      const passwordControl = group.get(password);
      const confirmPasswordControl = group.get(confirmPassword);
      if (confirmPasswordControl?.errors && !confirmPasswordControl?.errors['passwordMismatch']) {
        return;
      }
      if (passwordControl?.value !== confirmPasswordControl?.value) {
        confirmPasswordControl?.setErrors({ passwordMismatch: true });
      } else {
        confirmPasswordControl?.setErrors(null);
      }
    };
  }
  onCheckboxChange() {
    const isNotInFrance = this.registerForm.get('isNotInFrance')?.value;
    const companySirenControl = this.registerForm.get('companySiren');

    if (isNotInFrance) {
      // Remove the required validator if the checkbox is checked
      companySirenControl?.clearValidators();
      this.labelSiren = "Matricule fiscal"
    } else {
      // Re-apply the required validator if the checkbox is unchecked
      companySirenControl?.setValidators([Validators.required,Validators.pattern('^[0-9]{9}$')]);
      this.labelSiren = "Numéro SIREN de l'entreprise"
    }

    // Update the validity of the control
    companySirenControl?.updateValueAndValidity();
  }

  // Handle form submission
  onSubmit() {
    if (this.registerForm.valid) {
      const formData = this.registerForm.value;
  
      this.authService.register(formData.email, formData.password, formData.lastname, formData.firstname).pipe(
        switchMap((user) => {
          return this.contactService.createContact({
            user_id: user.user.id,
            nom: formData.lastname,
            prenom: formData.firstname,
            email: formData.email,
            telephone1: formData.phonenumber,
            fonction: formData.functionInCompany,
            standiste: false
          }).pipe(
            map((contact) => ({ user, contact }))
          );
        }),
        switchMap(({ user, contact }) => {
          return this.entrepriseService.createEntreprise({
            secteur_id: 1,
            nom: formData.companyName,
            logo: '',
            siren: formData.companySiren,
            contact_principal_id: contact.id, // Assuming contact has an ID
            user_id: user.user.id,
            activity: 0
          });
        })
      ).subscribe({
        next: (entreprise) => {
          console.log('Entreprise created:', entreprise);
          // Handle success (e.g., navigate or show success message)
        },
        error: (error) => {
          console.error('Error in registration flow:', error);
        }
      });
  
    } else {
      console.log('Form is invalid');
    }
  }
  

}
