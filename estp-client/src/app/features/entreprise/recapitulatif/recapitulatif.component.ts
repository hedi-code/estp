import { Component, OnInit } from '@angular/core';
import { ExposantService } from '../../forum/services/exposant.service';
import { Exposant } from '../../forum/models/exposant.model';
import { AuthCookieService } from '../../../core/services/auth-cookie.service';
import { EntrepriseService } from '../entreprise.service';

@Component({
  selector: 'app-recapitulatif',
  standalone: false,
  templateUrl: './recapitulatif.component.html',
  styleUrl: './recapitulatif.component.scss'
})
export class RecapitulatifComponent implements OnInit {
  exposants: Exposant[] = [];
  entrepriseId: number = 0;
  showDialog: boolean = false;
  isEditMode: boolean = false;
  currentExposant: Exposant = {
    entreprise_id: 0,
    nom: '',
    prenom: '',
    fonction: ''
  };

  constructor(
    private exposantService: ExposantService,
    private authCookieService: AuthCookieService,
    private entrepriseService: EntrepriseService
  ) {}

  ngOnInit(): void {
    this.loadEntrepriseAndExposants();
  }

  loadEntrepriseAndExposants(): void {
    this.entrepriseService.getEntrepriseByUserId().subscribe({
      next: (entreprise: any) => {
        this.entrepriseId = entreprise.id;
        this.loadExposants();
      },
      error: (err) => console.error('Error loading entreprise:', err)
    });
  }

  loadExposants(): void {
    if (this.entrepriseId) {
      this.exposantService.getExposantsByEntreprise(this.entrepriseId).subscribe({
        next: (data) => this.exposants = data,
        error: (err) => console.error('Error loading exposants:', err)
      });
    }
  }

  openCreateDialog(): void {
    this.isEditMode = false;
    this.currentExposant = {
      entreprise_id: this.entrepriseId,
      nom: '',
      prenom: '',
      fonction: ''
    };
    this.showDialog = true;
  }

  openEditDialog(exposant: Exposant): void {
    this.isEditMode = true;
    this.currentExposant = { ...exposant };
    this.showDialog = true;
  }

  closeDialog(): void {
    this.showDialog = false;
    this.currentExposant = {
      entreprise_id: this.entrepriseId,
      nom: '',
      prenom: '',
      fonction: ''
    };
  }

  saveExposant(): void {
    if (this.isEditMode && this.currentExposant.id) {
      this.exposantService.updateExposant(this.currentExposant.id, this.currentExposant).subscribe({
        next: () => {
          this.loadExposants();
          this.closeDialog();
        },
        error: (err) => console.error('Error updating exposant:', err)
      });
    } else {
      this.exposantService.createExposant(this.currentExposant).subscribe({
        next: () => {
          this.loadExposants();
          this.closeDialog();
        },
        error: (err) => console.error('Error creating exposant:', err)
      });
    }
  }

  deleteExposant(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet exposant ?')) {
      this.exposantService.deleteExposant(id).subscribe({
        next: () => this.loadExposants(),
        error: (err) => console.error('Error deleting exposant:', err)
      });
    }
  }
}
