import { Component, OnInit } from '@angular/core';
import { Commande2Service } from '../../services/commande2.service';
import { Option2Service } from '../../services/option2.service';
import { EntrepriseService } from '../../../entreprise/entreprise.service';
import { Commande2, Option2 } from '../../models/commande2.model';
import { Entreprise } from '../../../entreprise/entreprise.model';

interface StandisteData {
  commande2: Commande2;
  entreprise: Entreprise;
  standisteDetails: any;
}

@Component({
  selector: 'app-standiste',
  standalone: false,
  templateUrl: './standiste.component.html',
  styleUrl: './standiste.component.scss'
})
export class StandisteComponent implements OnInit {
  activeIndex: number = 0;
  standisteOptions: Option2[] = [];
  standisteData: { [optionId: number]: StandisteData[] } = {};
  loading: boolean = false;
  detailsDialogVisible: boolean = false;
  selectedData: StandisteData | null = null;

  constructor(
    private commande2Service: Commande2Service,
    private option2Service: Option2Service,
    private entrepriseService: EntrepriseService
  ) {}

  ngOnInit() {
    this.loadStandisteOptions();
  }

  loadStandisteOptions() {
    this.loading = true;
    // Load standiste options (IDs: 15, 21, 22) - fallback to get all options and filter
    this.option2Service.getAllOption2s().subscribe({
      next: (allOptions) => {
        this.standisteOptions = allOptions
          .filter(option => [15, 21, 22].includes(option.id))
          .sort((a, b) => a.ordre - b.ordre);
        this.loadStandisteData();
      },
      error: (err) => {
        console.error('Error loading standiste options:', err);
        this.loading = false;
      }
    });
  }

  loadStandisteData() {
    // Initialize data structure
    this.standisteOptions.forEach(option => {
      this.standisteData[option.id] = [];
    });

    // Load all commande2 and filter those with standiste status
    this.commande2Service.getAllCommande2s().subscribe({
      next: (allCommandes) => {
        const commandesWithStandiste = allCommandes.filter(commande =>
          commande.standiste_status && [15, 21, 22].includes(commande.standiste_status)
        );

        const loadPromises = commandesWithStandiste.map(commande =>
          this.loadEntrepriseForCommande(commande)
        );

        Promise.all(loadPromises).then(() => {
          this.loading = false;
        });
      },
      error: (err) => {
        console.error('Error loading commande2 data:', err);
        this.loading = false;
      }
    });
  }

  private loadEntrepriseForCommande(commande: Commande2): Promise<void> {
    return new Promise((resolve) => {
      this.entrepriseService.getEntrepriseById(commande.entreprise_id).subscribe({
        next: (entreprise) => {
          const standisteDetails = this.getStandisteDetails(commande);

          if (commande.standiste_status && this.standisteData[commande.standiste_status]) {
            this.standisteData[commande.standiste_status].push({
              commande2: commande,
              entreprise: entreprise,
              standisteDetails: standisteDetails
            });
          }
          resolve();
        },
        error: (err) => {
          console.error('Error loading entreprise:', err);
          resolve();
        }
      });
    });
  }

  private getStandisteDetails(commande: Commande2): any {
    switch (commande.standiste_status) {
      case 15: // No standiste
        return { message: 'Pas de standiste demandé' };
      case 21: // Project description
        return {
          type: 'Description du projet',
          description: commande.standiste_demande || 'Aucune description'
        };
      case 22: // Standiste details
        return {
          type: 'Fiche standiste',
          nom: commande.standiste_nom || 'Non renseigné',
          prenom: commande.standiste_prenom || 'Non renseigné',
          entreprise: commande.standiste_entreprise || 'Non renseigné',
          telephone: commande.standiste_telephone || 'Non renseigné'
        };
      default:
        return { message: 'Statut inconnu' };
    }
  }

  getTabLabel(option: Option2): string {
    switch (option.id) {
      case 15: return 'Je ne souhaite pas de standiste';
      case 21: return 'Je souhaite avoir un standiste';
      case 22: return "J'ai un standiste";
      default: return option.nom;
    }
  }

  getDataForActiveTab(): StandisteData[] {
    const activeOption = this.standisteOptions[this.activeIndex];
    return activeOption ? (this.standisteData[activeOption.id] || []) : [];
  }

  viewDetails(data: StandisteData) {
    this.selectedData = data;
    this.detailsDialogVisible = true;
  }

  downloadBC2(data: StandisteData) {
    // TODO: Implement BC2 download functionality
    console.log('Downloading BC2 for:', data.entreprise.nom);
    // This would typically trigger a PDF download or open the BC2 in a new tab
  }
}