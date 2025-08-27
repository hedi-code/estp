import { Component, OnInit } from '@angular/core';
import { EntrepriseService } from '../../../entreprise/entreprise.service';
import { Entreprise } from '../../../entreprise/entreprise.model';
import { AuthCookieService } from '../../../../core/services/auth-cookie.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { Commande1 } from '../../models/commande1.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../auth/auth.service';
import { ContactService } from '../../models/contact.service';
import { map, switchMap } from 'rxjs';
import { Contact } from '../../models/contact.model';

@Component({
  selector: 'app-entreprise-souscrites',
  standalone: false,
  templateUrl: './entreprise-souscrites.component.html',
  styleUrl: './entreprise-souscrites.component.scss'
})
export class EntrepriseSouscritesComponent implements OnInit {

  entreprises: Entreprise[] = []
  commercials: User[] = [];
  contacts: {entreprise_id: number, user:Contact}[] = [];
  users: {entreprise_id: number, user:User}[] = [];
  cmdAssigner: Entreprise | undefined;
  assignModel = false;
  role: String | null = ''
  createDialog = false;
  registerForm: FormGroup;
  labelSiren = "Numéro SIREN de l'entreprise";
  viewEntrepriseDialogVisible = false;
  selectedEntreprise: Entreprise | null = null

  constructor(private fb: FormBuilder, private entrepriseService: EntrepriseService, 
    private authService: AuthService,    private contactService: ContactService,
    private userService: UserService, private cookieService: AuthCookieService, 
        private confirmationService: ConfirmationService,
    private messageService: MessageService) {
    this.registerForm = this.fb.group({
      lastname: ['', Validators.required],
      firstname: ['', Validators.required],
      phonenumber: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      email: ['', [Validators.required, Validators.email]],
      companyName: ['', Validators.required],
      companySiren: ['', [Validators.required, Validators.pattern('^(\\d\\s*){4,15}$')]], // Example pattern for SIREN number
      isNotInFrance: [false],
      functionInCompany: ['', Validators.required],
      password: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{10,}$/)]],
      confirmPassword: ['', [Validators.required]],
    }, {
      validator: this.passwordMatcher('password', 'confirmPassword')
    });

  }
  ngOnInit(): void {
    this.role = this.cookieService.getRole();
    this.entrepriseService.getAllEntreprises().subscribe({
      next: (response) => {
        if (this.cookieService.getRole() == "comm") {
          this.entreprises = response.filter(e => e.commercial_id == Number(this.cookieService.getUserId()));
        }
        else {
          this.entreprises = response;
        }
      },
      error: (err) => console.log(err)
    })
    this.userService.getCommercials().subscribe({
      next: (response) => {
        this.commercials = response
      },
      error: (err) => console.log(err)
    })
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
  getCommercialData(id: number): User | undefined {
    return this.commercials.find(u => u.id == id);
  }
  assigner(cmd: Entreprise) {
    this.cmdAssigner = cmd;
    this.assignModel = true;
  }
  onRowDoubleClick(event: any) {
    if (this.cmdAssigner) {
      this.cmdAssigner.commercial_id = event.id;
      console.log(event)
      console.log(this.cmdAssigner)
      this.entrepriseService.updateEntreprise(this.cmdAssigner.id ?? 9999, this.cmdAssigner).subscribe({
        next: (response) => {
          this.messageService.add({ severity: 'success', summary: '', detail: 'Commercial assigné', life: 2000 });
          this.assignModel = false;
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: '', detail: 'Database error', life: 2000 });

        }
      })
    }

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
  openCreateDialog() {
    this.createDialog = true;
  }
   onSubmit() {
      if (this.registerForm.valid) {
        const formData = this.registerForm.value;
    
        this.authService.register(formData.email, formData.password, formData.lastname, formData.firstname, true).pipe(
          switchMap((user) => {
            return this.contactService.createContact({
              user_id: user.user.id,
              nom: formData.lastname,
              prenom: formData.firstname,
              email: formData.email,
              telephone1: formData.phonenumber,
              fonction: formData.functionInCompany,
              standiste: false,
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
    deleteEntreprise(event: any, entreprise: Entreprise){
 this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Voulez vous supprimer cette entreprise ?',
      icon: 'pi pi-info-circle',
      acceptLabel: 'Confirmer',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      accept: () => {
        this.entrepriseService.deleteEntreprise(entreprise.id ?? -1).subscribe(response => {
          this.entreprises.splice(this.entreprises.findIndex(e => e.id == entreprise.id),1)
        });
        if(entreprise.user_id){
          this.userService.delete(entreprise.user_id).subscribe();
        }
      },
      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'Annulé', detail: 'Supression annulé', life: 2000 });
      }
    });
    }

    afficherDetails(entreprise: Entreprise){
      this.selectedEntreprise = entreprise
      this.viewEntrepriseDialogVisible = true
    }
    // getEntrepriseContact(entreprise: Entreprise): Observable<Contact[]>{
    //   return this.contactService.getContactByUserId(entreprise.user_id ?? -1)
    // }
}
