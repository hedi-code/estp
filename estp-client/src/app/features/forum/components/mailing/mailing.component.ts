import { Component, OnInit } from '@angular/core';
import { EntrepriseService } from '../../../entreprise/entreprise.service';
import { Entreprise } from '../../../entreprise/entreprise.model';
import { EmailService } from '../../../../core/services/email.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-mailing',
  standalone: false,
  templateUrl: './mailing.component.html',
  styleUrl: './mailing.component.scss'
})
export class MailingComponent implements OnInit {

  entreprises: Entreprise[] = [];
  selectedEntreprises: Entreprise[] = [];
  emailDialogVisible = false;
  emailForm: FormGroup;
  loading = false;

  constructor(
    private entrepriseService: EntrepriseService,
    private emailService: EmailService,
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {
    this.emailForm = this.fb.group({
      subject: ['', Validators.required],
      message: ['', Validators.required],
      senderEmail: ['ne-pas-repondre@forumestp.fr', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    this.loadEntreprises();
  }

  loadEntreprises() {
    this.entrepriseService.getAllEntreprises().subscribe({
      next: (response) => {
        this.entreprises = response;
      },
      error: (err) => {
        console.error('Error loading enterprises:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des entreprises',
          life: 3000
        });
      }
    });
  }

  openEmailDialog() {
    if (this.selectedEntreprises.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Veuillez sélectionner au moins une entreprise',
        life: 3000
      });
      return;
    }
    this.emailDialogVisible = true;
  }

  sendGroupEmail() {
    if (this.emailForm.invalid) {
      this.markFormGroupTouched(this.emailForm);
      return;
    }

    const enterpriseNames = this.selectedEntreprises.map(e => e.nom).join(', ');

    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir envoyer un mail aux entreprises suivantes : ${enterpriseNames} ?`,
      header: 'Confirmation d\'envoi',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui, envoyer',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-primary',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.sendEmails();
      }
    });
  }

  private sendEmails() {
    this.loading = true;
    const formValue = this.emailForm.value;
    let successCount = 0;
    let errorCount = 0;

    // Send emails to each selected enterprise
    const emailPromises = this.selectedEntreprises.map(entreprise => {
      return new Promise((resolve, reject) => {
        // Get the contact email for the enterprise
        // For now, we'll use a placeholder email - you might want to get this from the contact
        const recipientEmail = entreprise.contact_email || 'contact@example.com';

        this.emailService.sendEmail({
          senderEmail: formValue.senderEmail,
          receiverEmail: recipientEmail,
          receiverName: entreprise.nom,
          subject: formValue.subject,
          htmlText: formValue.message
        }).subscribe({
          next: () => {
            successCount++;
            resolve(true);
          },
          error: (error: any) => {
            errorCount++;
            console.error(`Error sending email to ${entreprise.nom}:`, error);
            resolve(false);
          }
        });
      });
    });

    Promise.all(emailPromises).then(() => {
      this.loading = false;

      if (successCount > 0) {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: `${successCount} email(s) envoyé(s) avec succès`,
          life: 5000
        });
      }

      if (errorCount > 0) {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreurs',
          detail: `${errorCount} email(s) n'ont pas pu être envoyés`,
          life: 5000
        });
      }

      this.emailDialogVisible = false;
      this.emailForm.reset({
        senderEmail: 'ne-pas-repondre@forumestp.fr'
      });
      this.selectedEntreprises = [];
    });
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.controls[key];
      control.markAsTouched();
    });
  }

  cancelEmail() {
    this.emailDialogVisible = false;
    this.emailForm.reset({
      senderEmail: 'ne-pas-repondre@forumestp.fr'
    });
  }
}