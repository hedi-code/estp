import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Commande2Service } from '../../services/commande2.service';
import { Commande2, Commande2Option } from '../../models/commande2.model';
import { EntrepriseService } from '../../../entreprise/entreprise.service';
import { Entreprise } from '../../../entreprise/entreprise.model';
import { firstValueFrom, forkJoin, lastValueFrom } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Commande2OptionsService } from '../../services/commande2-options.service';
import { Option2Service } from '../../services/option2.service';
import { Option2, Option2Category } from '../../models/commande2.model';
import { environment } from '../../../../../environments/environment';
import { AuthCookieService } from '../../../../core/services/auth-cookie.service';
import { ContactService } from '../../models/contact.service';
import { Contact } from '../../models/contact.model';
import { EmailService } from '../../../../core/services/email.service';
import { cloneDeep } from 'lodash';
import { Table } from 'primeng/table';
import { DecimalPipe } from '@angular/common';
import { Option2CategoriesService } from '../../services/option2-categories.service';

interface CommandeWithEntreprise extends Commande2 {
  entreprise?: Entreprise,
  options?: Option2[]
}

@Component({
  selector: 'app-bc2-souscrits',
  standalone: false,
  templateUrl: './bc2-souscrits.component.html',
  styleUrl: './bc2-souscrits.component.scss'
})
export class Bc2SouscritsComponent implements OnInit {
  detailsDialog: boolean = false;
  commandes: CommandeWithEntreprise[] = [];
  entreprises: Entreprise[] = [];
  detailsCommande: CommandeWithEntreprise | undefined;
  optionsBc2: Option2[] = [];
  option2Categories: Option2Category[] = [];
  detailsOptions: Option2[] = [];
  baseUrl: String = environment.apiUrl;
  role: String | null = '';

  modifyDialog: boolean = false;
  modifyCommande: CommandeWithEntreprise | undefined;
  modificationsOptions: Option2[] = [];
  modifyTotalHt: number | undefined = 0;
  modificationCommandeOption: Commande2Option[] = [];
  modificationContact: Contact | undefined;

  createDialog: boolean = false;
  ajoutEntreprises: Entreprise[] = [];
  ajoutEntreprise: Entreprise | undefined;
  ajoutOption: Option2[] = [];
  ajoutTotalHt: number = 0;

  // Standiste form handling
  standisteForm!: FormGroup;
  modifyStandisteForm!: FormGroup;

  @ViewChild('dt') table!: Table;

  constructor(
    private commande2Service: Commande2Service,
    private entrepriseService: EntrepriseService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private commande2OptionService: Commande2OptionsService,
    private option2Service: Option2Service,
    private option2CategoriesService: Option2CategoriesService,
    private cookieService: AuthCookieService,
    private contactService: ContactService,
    private emailService: EmailService,
    private decimalPipe: DecimalPipe,
    private fb: FormBuilder
  ) {
    this.initStandisteForms();
  }

  ngOnInit(): void {
    this.role = this.cookieService.getRole();
    this.initData();
  }

  initStandisteForms() {
    this.standisteForm = this.fb.group({
      standiste_nom: ['', Validators.required],
      standiste_prenom: ['', Validators.required],
      standiste_telephone: ['', Validators.required],
      standiste_entreprise: ['', Validators.required],
      standiste_demande: ['', Validators.required]
    });

    this.modifyStandisteForm = this.fb.group({
      standiste_nom: ['', Validators.required],
      standiste_prenom: ['', Validators.required],
      standiste_telephone: ['', Validators.required],
      standiste_entreprise: ['', Validators.required],
      standiste_demande: ['', Validators.required]
    });
  }

  initData() {
    forkJoin({
      commandes: this.commande2Service.getAllCommande2s(),
      entreprises: this.entrepriseService.getAllEntreprises(),
      options: this.option2Service.getAllOption2s(),
      categories: this.option2CategoriesService.getAllOption2Categories()
    }).subscribe({
      next: ({ commandes, entreprises, options, categories }) => {
        this.optionsBc2 = options;
        this.option2Categories = categories;
        this.entreprises = entreprises;

        const commandeIds = commandes.map(c => c.entreprise_id);
        this.ajoutEntreprises = entreprises.filter(e => !commandeIds.includes(e.id ?? -1));
        this.ajoutOption = options;

        this.commandes = commandes.map(cmd => ({
          ...cmd,
          entreprise: entreprises.find(e => e.id === cmd.entreprise_id)
        }));

        if (this.cookieService.getRole() == "comm") {
          this.commandes = this.commandes.filter(c => c.entreprise?.commercial_id == Number(this.cookieService.getUserId()));
        }
      },
      error: (err) => console.log(err)
    });
  }

  getCommandeOptionConsultation() {
    this.detailsOptions = [];
    this.commande2OptionService.getOptionsByCommande2Id(this.detailsCommande?.id ?? -1).subscribe((response: Commande2Option[]) => {
      if (response && Array.isArray(response)) {
        response.forEach(element => {
          const foundOption = this.optionsBc2.find(o => o.id == element.option2_id);
          if (foundOption) {
            const option: Option2 = { ...foundOption };
            option.qteCommande = element.qty;
            option.colorCommande = element.color || '';
            this.detailsOptions.push(option);
          }
        });
      }
    });
  }

  getCommandeOptionModification() {
    this.modificationsOptions = [];
    this.optionsBc2.forEach(option => {
      option.qteCommande = 0;
      option.colorCommande = '';
    });
    this.commande2OptionService.getOptionsByCommande2Id(this.modifyCommande?.id ?? -1).subscribe((response: Commande2Option[]) => {
      if (response && Array.isArray(response)) {
        this.modificationCommandeOption = response;
        response.forEach(element => {
          const foundOption = this.optionsBc2.find(o => o.id == element.option2_id);
          if (foundOption) {
            const option: Option2 = { ...foundOption };
            option.qteCommande = element.qty;
            option.colorCommande = element.color || '';
            this.modificationsOptions.push(option);
          }
        });
      }
    });
  }

  modifierOption(opt: Option2) {
    // Special handling for standiste options (15, 21, 22) - only one can be selected
    if ([15, 21, 22].includes(opt.id)) {
      if (opt.qteCommande && opt.qteCommande > 0) {
        // Remove any other standiste options
        this.modificationsOptions = this.modificationsOptions.filter(o => ![15, 21, 22].includes(o.id) || o.id === opt.id);
        // Reset all other standiste options quantities
        this.optionsBc2.forEach(option => {
          if ([15, 21, 22].includes(option.id) && option.id !== opt.id) {
            option.qteCommande = 0;
          }
        });
        // Clear the standiste form
        this.modifyStandisteForm.reset();
      }
    }

    const existingIndex = this.modificationsOptions.findIndex(o => o.id === opt.id);
    if (existingIndex >= 0) {
      if (opt.qteCommande === 0) {
        this.modificationsOptions.splice(existingIndex, 1);
      } else {
        this.modificationsOptions[existingIndex] = opt;
      }
    } else if (opt.qteCommande && opt.qteCommande > 0) {
      this.modificationsOptions.push(opt);
    }

    this.getModifyCommandePrix();
    console.log(this.modificationsOptions);
  }

  deleteCommande(event: Event, cmd: Commande2) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Voulez vous supprimer ce BC2 ?',
      icon: 'pi pi-info-circle',
      acceptLabel: 'Confirmer',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      accept: () => {
        this.commande2Service.deleteCommande2(cmd.id).subscribe(response => {
          this.initData();
        });
      },
      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'Annulé', detail: 'Suppression annulée', life: 2000 });
      }
    });
  }

  validerCommande(event: Event, cmd: Commande2) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Voulez vous valider ce BC2 ?',
      icon: 'pi pi-info-circle',
      acceptLabel: 'Confirmer',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-sm',
      accept: () => {
        let commandeModifier: Commande2 = cmd;
        commandeModifier.valide = true;
        this.commande2Service.updateCommande2(cmd.id, commandeModifier).subscribe(response => {
          this.initData();
        });
      },
      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'Annulé', detail: 'Validation annulée', life: 2000 });
      }
    });
  }

  showDetailsDialog(cmd: CommandeWithEntreprise) {
    this.detailsDialog = true;
    this.detailsCommande = cmd;
    this.getCommandeOptionConsultation();
  }

  getTotalTva(total: number) {
    return total * 1.2;
  }

  async openModifyDialog(cmd?: CommandeWithEntreprise) {
    if (!!cmd) {
      this.modifyCommande = cmd;
      this.modifyTotalHt = cmd.total_ht;
      this.getCommandeOptionModification();
      this.modificationContact = await this.getContactPrincipalNom();

      // Populate standiste form with existing data
      this.modifyStandisteForm.patchValue({
        standiste_nom: cmd.standiste_nom || '',
        standiste_prenom: cmd.standiste_prenom || '',
        standiste_telephone: cmd.standiste_telephone || '',
        standiste_entreprise: cmd.standiste_entreprise || '',
        standiste_demande: cmd.standiste_demande || ''
      });

      this.modifyDialog = true;
    }
  }

  getModifyCommandePrix() {
    this.modifyTotalHt = 0;
    this.modificationsOptions.forEach(o => {
      if (o && this.modifyTotalHt !== undefined) {
        this.modifyTotalHt += (o.qteCommande ?? 0) * (o.prix_ht ?? 0);
      }
    });
  }

  validerOptionCommande() {
    if (this.modifyCommande) {
      const selectedStandiste = this.getSelectedStandisteOptionForModify();
      const standisteFormValues = this.modifyStandisteForm.value;

      if (this.modifyTotalHt) {
        this.modifyCommande.total_ht = this.modifyTotalHt;
      }

      // Update standiste information
      this.modifyCommande.standiste_nom = selectedStandiste === 22 ? standisteFormValues.standiste_nom : null;
      this.modifyCommande.standiste_prenom = selectedStandiste === 22 ? standisteFormValues.standiste_prenom : null;
      this.modifyCommande.standiste_entreprise = selectedStandiste === 22 ? standisteFormValues.standiste_entreprise : null;
      this.modifyCommande.standiste_telephone = selectedStandiste === 22 ? standisteFormValues.standiste_telephone : null;
      this.modifyCommande.standiste_demande = selectedStandiste === 21 ? standisteFormValues.standiste_demande : null;
      this.modifyCommande.standiste_status = selectedStandiste || 0;

      this.commande2Service.updateCommande2(this.modifyCommande?.id ?? -1, this.modifyCommande).subscribe({
        error: (err) => console.log(err)
      });

      this.modificationsOptions.forEach(o => {
        if (o.qteCommande == 0) {
          this.commande2OptionService.removeOptionFromCommande2(this.modificationCommandeOption.find(op => op.option2_id === o.id)?.id ?? -1).subscribe({
            error: (err: any) => console.log(err)
          });
        }
        else if (o.qteCommande && o.qteCommande > 0) {
          let option: Commande2Option | undefined = this.modificationCommandeOption.find(op => op.option2_id === o.id);
          if (option) {
            this.commande2OptionService.updateCommande2Option(option.id ?? -1, {
              qty: o.qteCommande || -1,
              color: o.colorCommande || undefined
            }).subscribe({
              error: (err: any) => console.log(err)
            });
          }
          else {
            this.commande2OptionService.addOptionToCommande2({
              commande2_id: this.modifyCommande?.id ?? -1,
              option2_id: o.id,
              qty: o.qteCommande,
              color: o.colorCommande
            }).subscribe();
          }
        }
      });

      this.commandes[this.commandes.findIndex(c => c.id == this.modifyCommande?.id)].total_ht = this.modifyTotalHt ?? 0;
    }
    this.modifyDialog = false;
  }

  async getContactPrincipalNom(): Promise<Contact | undefined> {
    const id = this.modifyCommande?.entreprise?.contact_principal_id ?? -1;
    try {
      const contact = await firstValueFrom(this.contactService.getContact(id));
      return contact;
    } catch (error) {
      console.error('Error fetching contact:', error);
      return;
    }
  }

  openCreateDialog() {
    this.createDialog = true;
    this.ajoutTotalHt = 0;
  }

  calculerCreerPrix(changedOption?: Option2) {
    // Special handling for standiste options (15, 21, 22) - only one can be selected
    if (changedOption && [15, 21, 22].includes(changedOption.id)) {
      if (changedOption.qteCommande && changedOption.qteCommande > 0) {
        // Reset all other standiste options quantities
        this.ajoutOption.forEach(option => {
          if ([15, 21, 22].includes(option.id) && option.id !== changedOption.id) {
            option.qteCommande = 0;
          }
        });
        // Clear the standiste form
        this.standisteForm.reset();
      }
    }

    this.ajoutTotalHt = 0;
    this.ajoutOption.forEach(o => {
      if (o.qteCommande) {
        this.ajoutTotalHt = this.ajoutTotalHt + ((o.prix_ht ?? 1) * (o.qteCommande ?? 1));
      }
    });
    console.log(this.ajoutTotalHt);
  }

  createNouvelleCommande() {
    const selectedStandiste = this.getSelectedStandisteOptionForCreate();
    const standisteFormValues = this.standisteForm.value;

    this.commande2Service.createCommande2({
      entreprise_id: this.ajoutEntreprise?.id ?? -1,
      valide: false,
      total_ht: this.ajoutTotalHt,
      pack2_id: null,
      pack2_color: null,
      reduc_pct: 0,
      remise_pack_plus: null,
      total_ht_avt_remise: this.ajoutTotalHt,
      created: new Date(),
      modified: new Date(),
      standiste_nom: selectedStandiste === 22 ? standisteFormValues.standiste_nom : null,
      standiste_prenom: selectedStandiste === 22 ? standisteFormValues.standiste_prenom : null,
      standiste_entreprise: selectedStandiste === 22 ? standisteFormValues.standiste_entreprise : null,
      standiste_telephone: selectedStandiste === 22 ? standisteFormValues.standiste_telephone : null,
      standiste_demande: selectedStandiste === 21 ? standisteFormValues.standiste_demande : null,
      standiste_status: selectedStandiste || 0,
      validation_lieu: null
    }).subscribe({
      next: (resp: { message: string; id: number }) => {
        // Add selected options to the new commande
        const optionsToAdd = this.ajoutOption.filter(o => o.qteCommande && o.qteCommande > 0);
        if (optionsToAdd.length > 0) {
          const optionObservables = optionsToAdd.map(option =>
            this.commande2OptionService.addOptionToCommande2({
              commande2_id: resp.id,
              option2_id: option.id,
              qty: option.qteCommande ?? 1,
              color: option.colorCommande || undefined
            })
          );
          forkJoin(optionObservables).subscribe(() => {
            this.initData();
            this.resetCreateForm();
          });
        } else {
          this.initData();
          this.resetCreateForm();
        }
      }
    });
  }

  resetCreateForm() {
    this.ajoutEntreprise = undefined;
    this.ajoutTotalHt = 0;
    this.ajoutOption.forEach(o => {
      o.qteCommande = 0;
      o.colorCommande = '';
    });
    this.createDialog = false;
  }

  exportCSV() {
    if (!this.commandes?.length) {
      console.warn('Aucune donnée à exporter');
      return;
    }

    const headers = ['ID', 'Entreprise', 'Total HT', 'Créé le', 'Standiste Status'];
    const rows = this.commandes.map(cmd => ({
      id: cmd.id,
      entreprise: cmd.entreprise?.nom ?? '',
      total_ht: cmd.total_ht ?? '',
      created: cmd.created ? new Date(cmd.created).toLocaleString('fr-FR') : '',
      standiste_status: cmd.standiste_status ?? ''
    }));

    const csv = this.convertToCSV(rows, headers);
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'commandes_bc2.csv';
    link.click();
  }

  convertToCSV(data: any[], headers: string[]): string {
    const replacer = (key: any, value: any) => value === null || value === undefined ? '' : value;
    const headerKeys = Object.keys(data[0]);

    const csvRows = [
      headers.join(';'),
      ...data.map(row =>
        headerKeys.map(field => JSON.stringify(row[field], replacer)).join(';')
      )
    ];

    return csvRows.join('\r\n');
  }

  getOptionsByCategory2(categoryId: number | null): Option2[] {
    if (categoryId === null) {
      return this.optionsBc2.filter(option => option.category_id === null || option.category_id === undefined);
    }
    return this.optionsBc2.filter(option => option.category_id === categoryId);
  }

  getCategoryName2(categoryId: number | null): string {
    if (!categoryId) return 'Sans catégorie';
    const category = this.option2Categories.find(c => c.id === categoryId);
    return category ? category.name : 'Catégorie inconnue';
  }

  // Standiste helper methods
  getSelectedStandisteOptionForCreate(): number | null {
    const standisteOption = this.ajoutOption.find(option =>
      [15, 21, 22].includes(option.id) && option.qteCommande && option.qteCommande > 0
    );
    return standisteOption ? standisteOption.id : null;
  }

  getSelectedStandisteOptionForModify(): number | null {
    const standisteOption = this.modificationsOptions.find(option =>
      [15, 21, 22].includes(option.id) && option.qteCommande && option.qteCommande > 0
    );
    return standisteOption ? standisteOption.id : null;
  }

  isStandisteFormValid(): boolean {
    const selectedStandiste = this.getSelectedStandisteOptionForCreate();
    if (selectedStandiste === 15) return true; // No standiste - no form needed
    if (selectedStandiste === 21) return this.standisteForm.get('standiste_demande')?.valid ?? false;
    if (selectedStandiste === 22) return this.standisteForm.valid;
    return true; // No standiste option selected
  }

  isModifyStandisteFormValid(): boolean {
    const selectedStandiste = this.getSelectedStandisteOptionForModify();
    if (selectedStandiste === 15) return true; // No standiste - no form needed
    if (selectedStandiste === 21) return this.modifyStandisteForm.get('standiste_demande')?.valid ?? false;
    if (selectedStandiste === 22) return this.modifyStandisteForm.valid;
    return true; // No standiste option selected
  }
}
