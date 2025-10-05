import { Component, OnInit } from '@angular/core';
import { EntrepriseService } from '../../../entreprise/entreprise.service';
import { EntrepriseWithPack1 } from '../../../entreprise/entreprise.model';
import { AuthCookieService } from '../../../../core/services/auth-cookie.service';

@Component({
  selector: 'app-gestion-plan',
  standalone: false,
  templateUrl: './gestion-plan.component.html',
  styleUrl: './gestion-plan.component.scss'
})
export class GestionPlanComponent implements OnInit {
  entreprises: EntrepriseWithPack1[] = [];
  entreprisesWithPlacePlan: EntrepriseWithPack1[] = [];
  entreprisesWithoutPlacePlan: EntrepriseWithPack1[] = [];

  selectedEntreprise!: EntrepriseWithPack1;
  displayPlacePlanDialog = false;
  placePlanValue: string = '';

  activeTab = 0; // 0 = without place_plan, 1 = with place_plan

  constructor(
    private entrepriseService: EntrepriseService,
    private cookieService: AuthCookieService
  ) {}

  ngOnInit(): void {
    this.loadEntreprises();
  }

  loadEntreprises() {
    this.entrepriseService.getEntreprisesWithPack1s().subscribe({
      next: (data) => {
        this.entreprises = data || [];
        this.filterEntreprises();
      },
      error: (e) => console.error(e),
    });
  }

  filterEntreprises() {
    this.entreprisesWithoutPlacePlan = this.entreprises.filter(e => !e.place_plan);
    this.entreprisesWithPlacePlan = this.entreprises.filter(e => e.place_plan);
  }

  canManagePlacePlan(): boolean {
    const role = this.cookieService.getRole();
    return role === 'resplan' || role === 'pres';
  }

  openPlacePlanDialog(entreprise: EntrepriseWithPack1) {
    if (!this.canManagePlacePlan()) {
      return;
    }
    this.selectedEntreprise = { ...entreprise };
    this.placePlanValue = entreprise.place_plan || '';
    this.displayPlacePlanDialog = true;
  }

  savePlacePlan() {
    if (!this.selectedEntreprise || !this.selectedEntreprise.id) return;

    const newPlacePlan = this.placePlanValue.trim() || null;

    this.entrepriseService.updatePlacePlan(this.selectedEntreprise.id, newPlacePlan).subscribe({
      next: () => {
        this.displayPlacePlanDialog = false;
        this.loadEntreprises();
      },
      error: (e) => console.error(e),
    });
  }

  cancelPlacePlan() {
    this.displayPlacePlanDialog = false;
    this.placePlanValue = '';
  }

  getPackDescription(entreprise: EntrepriseWithPack1): string {
    if (!entreprise.pack1_titre) {
      return '-';
    }
    let description = entreprise.pack1_titre;
    if (entreprise.surface) {
      description += ` ${entreprise.surface}m²`;
    }
    if (entreprise.surface_prix) {
      description += ` (${entreprise.surface_prix} €)`;
    }
    return description;
  }
}
