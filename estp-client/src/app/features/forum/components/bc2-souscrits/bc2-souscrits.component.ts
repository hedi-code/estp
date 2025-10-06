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

  // PDF viewing
  factureDialog: boolean = false;
  factureVisible: boolean = false;
  currentFactureCommande: CommandeWithEntreprise | undefined;
  bc2DialogVisible: boolean = false;

  @ViewChild('dt') table!: Table;
  @ViewChild('factureBc2') factureBc2!: any;

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
            // Update the original option in optionsBc2 array
            foundOption.qteCommande = element.qty;
            foundOption.colorCommande = element.color || '';
            // Add a copy to modificationsOptions
            const option: Option2 = { ...foundOption };
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

  async validerOptionCommande() {
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

      // Update commande in database
      await lastValueFrom(this.commande2Service.updateCommande2(this.modifyCommande?.id ?? -1, this.modifyCommande));

      // Update options
      const updatePromises = this.modificationsOptions.map(async (o) => {
        if (o.qteCommande == 0) {
          const existingOption = this.modificationCommandeOption.find(op => op.option2_id === o.id);
          if (existingOption) {
            await lastValueFrom(this.commande2OptionService.removeOptionFromCommande2(existingOption.id ?? -1));
          }
        }
        else if (o.qteCommande && o.qteCommande > 0) {
          let option: Commande2Option | undefined = this.modificationCommandeOption.find(op => op.option2_id === o.id);
          if (option) {
            await lastValueFrom(this.commande2OptionService.updateCommande2Option(option.id ?? -1, {
              qty: o.qteCommande || -1,
              color: o.colorCommande || undefined
            }));
          }
          else {
            await lastValueFrom(this.commande2OptionService.addOptionToCommande2({
              commande2_id: this.modifyCommande?.id ?? -1,
              option2_id: o.id,
              qty: o.qteCommande,
              color: o.colorCommande
            }));
          }
        }
      });

      await Promise.all(updatePromises);

      // Update local data
      this.commandes[this.commandes.findIndex(c => c.id == this.modifyCommande?.id)].total_ht = this.modifyTotalHt ?? 0;

      // Reload the commande options for the facture
      await this.loadCommandeOptionsForFacture(this.modifyCommande?.id ?? -1);

      // Show BC2 regeneration dialog
      this.modifyDialog = false;
      this.bc2DialogVisible = true;
    }
  }

  async regenerateBC2Pdf() {
    await this.factureBc2.generatedPdf("bc2", this.modifyCommande?.entreprise?.id + "_BC2", "contentToExportBc2");
    this.messageService.add({ severity: 'success', summary: '', detail: 'BC2 regénéré', life: 2000 });
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

  async showFactureDialog(cmd: CommandeWithEntreprise) {
    this.currentFactureCommande = cmd;
    this.modificationCommandeOption = [];

    // Load the options for the facture
    await this.loadCommandeOptionsForFacture(cmd.id ?? -1);

    // Load contact information
    this.modificationContact = await this.getContactPrincipalNom();

    this.factureDialog = true;
  }

  async loadCommandeOptionsForFacture(commandeId: number): Promise<void> {
    return new Promise((resolve) => {
      this.commande2OptionService.getOptionsByCommande2Id(commandeId).subscribe({
        next: (response: Commande2Option[]) => {
          if (response && Array.isArray(response)) {
            // Map the response to include option details with correct TVA rates
            this.modificationCommandeOption = response.map(cmdOption => {
              const foundOption = this.optionsBc2.find(o => o.id === cmdOption.option2_id);
              return {
                ...cmdOption,
                option_nom: foundOption?.nom || 'Option inconnue',
                option_prix_ht: foundOption?.prix_ht || 0,
                option_taux_tva: foundOption?.taux_tva || 20 // Ensure we get the correct TVA rate
              };
            });
          }
          resolve();
        },
        error: (err) => {
          console.error('Error loading commande options:', err);
          resolve();
        }
      });
    });
  }

  viewPDF(cmd: CommandeWithEntreprise) {
    const pdfUrl = `${this.baseUrl}/api/uploads/bc2/${cmd.entreprise?.id}_BC2.pdf`;
    window.open(pdfUrl, '_blank');
  }

  async envoyerFacture() {
    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + 15);
    const formattedDate = dueDate.toLocaleDateString('fr-FR');

    try {
      // Step 1: Wait for PDF to be generated and uploaded
      await this.factureBc2.generatedPdf(
        "facture",
        `festp.2025.${this.modifyCommande?.entreprise_id}.fct2`,
        "contentToExport"
      );

      // Step 2: Send the email with attachment
      await lastValueFrom(this.emailService.sendInvoice({
        senderEmail: "ne-pas-repondre.facturation@forumestp.fr",
        receiverEmail: this.modificationContact?.email ?? "hedibensafegine.noxaved@gmail.com",
        receiverName: `${this.factureBc2.modificationContact?.prenom} ${this.factureBc2.modificationContact?.nom}`,
        subject: this.modificationContact?.email ? "Facture BC2-Forum ESTP 2025" : "ERREUR FACTURATION",
        htmlText: `
          <p>Cher(e) <strong>${this.factureBc2.modificationContact?.prenom} ${this.factureBc2.modificationContact?.nom}</strong>,</p>
         
<p>J’espère que vous allez bien.</p>

<p>Nous tenons à vous remercier pour votre confiance. Nous préparons actuellement tout le nécessaire pour que votre journée au Forum soit une réussite.</p>

<p>Veuillez trouver ci-joint la facture festp.2025.${this.modifyCommande?.entreprise?.id}.fct2 relative à votre bon de commande BC2 pour la 46e édition du FORUM ESTP.</p>

<p>Conformément à nos conditions de paiement, nous vous prions de bien vouloir régler le solde de <?= $rest ?> correspondant au bon de commande 2 avant le ${this.factureBc2.customDateSolde.toLocaleDateString('fr-FR', {
  day: '2-digit',
  month: 'long', // full month name
  year: 'numeric',
})}.</p>

<p>Nous vous remercions par avance pour le respect de cette échéance nécessaire à la bonne organisation de notre Forum. Pour toute question ou information complémentaire, n’hésitez pas à me contacter directement.</p>

<p>Merci pour votre confiance et votre collaboration.</p>

<p>Cordialement,</p>
          <p>
          <strong>Kahina SAIBI</strong><br />
          Trésorière FORUM ESTP<br />
          0781616766<br />
          <a href="mailto:kahina.saibi@forumestp.fr">kahina.saibi@forumestp.fr</a>
          </p>
        `,
        ccEmails: ["kahina.saibi@forumestp.fr"],
        attachmentName: `festp.2025.${this.modifyCommande?.entreprise_id}.fct2.pdf`
      }));

      // Step 3: Set fct_envoyee = true in backend
      this.commande2Service.setFactureEnvoyee(this.modifyCommande?.id ?? -1).subscribe({
        next: () => {
          const index = this.commandes.findIndex(c => c.id === this.modifyCommande?.id);
          if (index !== -1) this.commandes[index].fct_envoyee = true;
        }
      });

    } catch (err) {
      console.error("❌ Error during envoyerFacture:", err);
    }
  }

  async downloadFacture() {
    await this.factureBc2.generatedPdf(
      "facture",
      "festp.2025." + this.modifyCommande?.entreprise_id + ".fct2",
      "contentToExport"
    );

    const filePath = `${this.baseUrl}/api/uploads/facture/festp.2025.${this.modifyCommande?.entreprise_id}.fct2.pdf`;
    const link = document.createElement('a');
    link.href = filePath;
    link.setAttribute('target', '_blank');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  openModifierFactureDialog() {
    this.factureBc2.visible = true;
  }

  calculateTotalHTForFacture(): number {
    // Filter out standiste options for calculation
    const nonStandisteOptions = this.modificationCommandeOption.filter(option =>
      ![15, 21, 22].includes(option.option2_id)
    );

    return nonStandisteOptions.reduce((total, option) => {
      return total + ((option.option_prix_ht || 0) * (option.qty || 1));
    }, 0);
  }

  setFacturePayee(cmd: CommandeWithEntreprise) {
    this.commande2Service.setFacturePayee(cmd.id).subscribe({
      next: (success) => {
        this.commandes[this.commandes.findIndex(c => c.id === cmd.id)].fct_payee = true;
      }
    });
  }

  async openFactureDialog(cmd: CommandeWithEntreprise) {
    this.modifyCommande = cloneDeep(cmd);
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

    this.factureVisible = true;
  }
}
