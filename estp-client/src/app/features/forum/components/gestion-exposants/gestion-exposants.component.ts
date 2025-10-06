import { Component, OnInit } from '@angular/core';
import { ExposantService } from '../../services/exposant.service';
import { Exposant } from '../../models/exposant.model';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-gestion-exposants',
  standalone: false,
  templateUrl: './gestion-exposants.component.html',
  styleUrl: './gestion-exposants.component.scss'
})
export class GestionExposantsComponent implements OnInit {
  exposants: any[] = [];
  filteredExposants: any[] = [];
  showDialog: boolean = false;
  isEditMode: boolean = false;
  currentExposant: Exposant = {
    entreprise_id: 0,
    nom: '',
    prenom: '',
    fonction: ''
  };
  searchText: string = '';
  groupedExposants: { [key: string]: any[] } = {};

  constructor(
    private exposantService: ExposantService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadExposants();
  }

  loadExposants(): void {
    this.exposantService.getAllExposantsWithEntreprise().subscribe({
      next: (data) => {
        this.exposants = data;
        this.applyFilter();
        this.groupByEntreprise();
      },
      error: (err) => console.error('Error loading exposants:', err)
    });
  }

  applyFilter(): void {
    if (!this.searchText.trim()) {
      this.filteredExposants = [...this.exposants];
    } else {
      const search = this.searchText.toLowerCase();
      this.filteredExposants = this.exposants.filter(exp =>
        exp.nom.toLowerCase().includes(search) ||
        exp.prenom.toLowerCase().includes(search) ||
        exp.fonction.toLowerCase().includes(search) ||
        exp.entreprise_nom?.toLowerCase().includes(search) ||
        exp.entreprise_siret?.toLowerCase().includes(search)
      );
    }
    this.groupByEntreprise();
  }

  groupByEntreprise(): void {
    this.groupedExposants = {};
    this.filteredExposants.forEach(exp => {
      const entrepriseName = exp.entreprise_nom || 'Sans entreprise';
      if (!this.groupedExposants[entrepriseName]) {
        this.groupedExposants[entrepriseName] = [];
      }
      this.groupedExposants[entrepriseName].push(exp);
    });
  }

  getEntrepriseKeys(): string[] {
    return Object.keys(this.groupedExposants).sort();
  }

  openCreateDialog(): void {
    this.isEditMode = false;
    this.currentExposant = {
      entreprise_id: 0,
      nom: '',
      prenom: '',
      fonction: ''
    };
    this.showDialog = true;
  }

  openEditDialog(exposant: any): void {
    this.isEditMode = true;
    this.currentExposant = {
      id: exposant.id,
      entreprise_id: exposant.entreprise_id,
      nom: exposant.nom,
      prenom: exposant.prenom,
      fonction: exposant.fonction
    };
    this.showDialog = true;
  }

  closeDialog(): void {
    this.showDialog = false;
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

  deleteExposant(exposant: any): void {
    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir supprimer ${exposant.prenom} ${exposant.nom} ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.exposantService.deleteExposant(exposant.id).subscribe({
          next: () => this.loadExposants(),
          error: (err) => console.error('Error deleting exposant:', err)
        });
      }
    });
  }
}
