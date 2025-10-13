import { Component, OnInit } from '@angular/core';
import { ExposantService } from '../../forum/services/exposant.service';
import { Exposant } from '../../forum/models/exposant.model';
import { AuthCookieService } from '../../../core/services/auth-cookie.service';
import { EntrepriseService } from '../entreprise.service';
import { environment } from '../../../../environments/environment';
import { ConfigService } from '../../forum/services/config.service';
import { Config } from '../../forum/models/config.model';

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
  baseUrl: string = environment.apiUrl;
  ficheSpsConfig: Config | null = null;
  dossierTechniqueConfig: Config | null = null;
  currentExposant: Exposant = {
    entreprise_id: 0,
    nom: '',
    prenom: '',
    fonction: ''
  };

  constructor(
    private exposantService: ExposantService,
    private authCookieService: AuthCookieService,
    private entrepriseService: EntrepriseService,
    private configService: ConfigService
  ) {}

  ngOnInit(): void {
    this.loadEntrepriseAndExposants();
    this.loadConfigFiles();
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

  downloadBC1(): void {
    if (this.entrepriseId) {
      const pdfUrl = `${this.baseUrl}/api/uploads/bc1/${this.entrepriseId}_BC1.pdf`;
      fetch(pdfUrl)
        .then(response => response.blob())
        .then(blob => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `BC1_${this.entrepriseId}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        })
        .catch(err => console.error('Error downloading BC1:', err));
    }
  }

  downloadBC2(): void {
    if (this.entrepriseId) {
      const pdfUrl = `${this.baseUrl}/api/uploads/bc2/${this.entrepriseId}_BC2.pdf`;
      fetch(pdfUrl)
        .then(response => response.blob())
        .then(blob => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `BC2_${this.entrepriseId}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        })
        .catch(err => console.error('Error downloading BC2:', err));
    }
  }

  loadConfigFiles(): void {
    this.configService.getConfigByName('fiche_sps').subscribe({
      next: (config) => this.ficheSpsConfig = config,
      error: (err) => console.error('Error loading fiche_sps config:', err)
    });

    this.configService.getConfigByName('dossier_technique_standiste').subscribe({
      next: (config) => this.dossierTechniqueConfig = config,
      error: (err) => console.error('Error loading dossier_technique_standiste config:', err)
    });
  }

  downloadFicheSps(): void {
    if (this.ficheSpsConfig && this.ficheSpsConfig.config_value) {
      const pdfUrl = `${this.baseUrl}/api/uploads/config/${this.ficheSpsConfig.config_value}`;
      fetch(pdfUrl)
        .then(response => response.blob())
        .then(blob => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = this.ficheSpsConfig!.config_value;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        })
        .catch(err => console.error('Error downloading fiche SPS:', err));
    }
  }

  downloadDossierTechnique(): void {
    if (this.dossierTechniqueConfig && this.dossierTechniqueConfig.config_value) {
      const pdfUrl = `${this.baseUrl}/api/uploads/config/${this.dossierTechniqueConfig.config_value}`;
      fetch(pdfUrl)
        .then(response => response.blob())
        .then(blob => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = this.dossierTechniqueConfig!.config_value;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        })
        .catch(err => console.error('Error downloading dossier technique:', err));
    }
  }
}
