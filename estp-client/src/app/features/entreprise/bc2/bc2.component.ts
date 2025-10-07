import { Component, ElementRef, HostListener, OnInit, ViewChild, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { Option2Service } from '../../forum/services/option2.service';
import { Option2CategoriesService } from '../../forum/services/option2-categories.service';
import { Commande2Service } from '../../forum/services/commande2.service';
import { Commande2OptionsService } from '../../forum/services/commande2-options.service';
import { Commande1Service } from '../../forum/services/commande1.service';
import { environment } from './../../../../environments/environment';
import { Option2, Option2Category, Commande2, Commande2Option } from '../../forum/models/commande2.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EntrepriseService } from '../entreprise.service';
import { AuthCookieService } from '../../../core/services/auth-cookie.service';
import { Entreprise } from '../entreprise.model';
import { ContactService } from '../../forum/models/contact.service';
import { Contact } from '../../forum/models/contact.model';
import { forkJoin, lastValueFrom, take } from 'rxjs';
import { ConfirmationService } from 'primeng/api';
import { FactureBc2Component } from './facture-bc2/facture-bc2.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bc2',
  standalone: false,
  templateUrl: './bc2.component.html',
  styleUrl: './bc2.component.scss'
})
export class Bc2Component implements OnInit {
  activeIndex: number = 0;
  baseUrl: string = environment.apiUrl;
  option2Categories: Option2Category[] = [];
  option2sByCategory: { [categoryId: number]: Option2[] } = {};
  optionQuantities: { [key: number]: number } = {};
  // Removed optionColors as we no longer need color selection
  selectedOptions: Commande2Option[] = [];
  selectedPack: any = null;
  packColor: string = '';

  // For grouped options (Electricité, Internet, Elingues)
  selectedGroupOptions: { [groupName: string]: Option2 } = {};
  groupedOptionsCache: { [categoryId: number]: any[] } = {};

  isDisabled = true;
  savedSignature: any;

  reservationForm!: FormGroup;
  standisteForm!: FormGroup;
  entreprise: Entreprise | undefined;
  contactPrincipal: Contact | undefined;

  @ViewChild('factureBc2') factureBc2!: FactureBc2Component;
  @ViewChild('factureBc2Dialog') factureBc2Dialog!: FactureBc2Component;

  factureDialogVisible = false;

@ViewChild('canvasBC2', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private isDrawing = false;
  private lastX = 0;
  private lastY = 0;

  constructor(
    private option2Service: Option2Service,
    private option2CategoriesService: Option2CategoriesService,
    private commande2Service: Commande2Service,
    private commande2OptionsService: Commande2OptionsService,
    private commande1Service: Commande1Service,
    private fb: FormBuilder,
    private entrepriseService: EntrepriseService,
    private cookieService: AuthCookieService,
    private contactService: ContactService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    // Force start on first tab
    await this.initializeForms();
    await this.checkBC1ExistenceAndProceed();
    this.activeIndex = 0;
  }

  initializeForms() {
    this.reservationForm = this.fb.group({
      nom: ['', Validators.required],
      rue: ['', Validators.required],
      codePostale: ['', Validators.required],
      ville: ['', Validators.required],
      telephone_standard: ['', Validators.required],
      nomResponsable: ['', Validators.required],
      prenomResponsable: ['', Validators.required],
      telResponsable: ['', Validators.required],
      faitA: ['', Validators.required],
      emailResponsable: ['', [Validators.required, Validators.email]]
    });


    this.standisteForm = this.fb.group({
      standiste_nom: [''],
      standiste_prenom: [''],
      standiste_entreprise: [''],
      standiste_telephone: [''],
      standiste_demande: ['']
    });
  }

  checkBC1ExistenceAndProceed(): Promise<void> {
    return new Promise((resolve, reject) => {
    const entrepriseId = Number(this.cookieService.getEntrepriseId());
    console.log('Checking BC1 existence for entreprise ID:', entrepriseId);

    // Check if BC1 exists first
    this.commande1Service.getCommande1ByEntrepriseId(entrepriseId).subscribe({
      next: (bc1Response) => {
        console.log('BC1 response received:', bc1Response);
        if (bc1Response && bc1Response.id) {
          // BC1 exists, proceed to load BC2 data
          console.log('BC1 exists, loading BC2 data');
          this.loadData();
          this.checkExistingCommande2();
          resolve();
        } else {
          // BC1 doesn't exist, redirect to BC1
          console.log('BC1 does not exist, redirecting to BC1');
          this.router.navigate(['/entreprise/bc1']);
          resolve();
        }
      },
      error: (error) => {
        // If error (likely 404), BC1 doesn't exist
        console.log('BC1 does not exist (error), redirecting to BC1. Error:', error);
        this.router.navigate(['/entreprise/bc1']);
        resolve();
      }
    });
    });
  }

  checkExistingCommande2() {
    // Always start on first tab (index 0) - never jump to Récapitulatif automatically
    this.activeIndex = 0;

    // Check if commande2 already exists (for informational purposes only)
    this.commande2Service.getCommande2ByEntrepriseId(Number(this.cookieService.getEntrepriseId())).subscribe({
      next: (response) => {
        if (response && response.id) {
          console.log('BC2 already exists for this entreprise');
          // Always start on first tab regardless of existing BC2
          this.activeIndex = 0;
        }
      },
      error: () => {
        // No existing BC2, start on first tab
        this.activeIndex = 0;
      }
    });
  }

  loadData() {
    console.log('loadData() called');
    // Load categories and options
    this.option2CategoriesService.getAllOption2Categories().subscribe({
      next: (categories) => {
        console.log('Categories loaded:', categories);
        console.log('Number of categories:', categories.length);
        // Sort categories by ordre field
        this.option2Categories = categories.sort((a, b) => (a.ordre || 0) - (b.ordre || 0));
        console.log('option2Categories after assignment and sorting:', this.option2Categories);
        // Ensure we start on the first category tab after categories are loaded
        this.activeIndex = 0;
        console.log('activeIndex set to:', this.activeIndex);
        console.log('Total tabs will be:', this.getTotalTabsCount());
        // Force change detection
        this.cdr.detectChanges();

        // Load options for each category
        categories.forEach(category => {
          this.option2Service.getOption2sByCategory(category.id).subscribe({
            next: (options) => {
              console.log(`Options loaded for category ${category.id} (${category.name}):`, options);
              this.option2sByCategory[category.id] = options;
              // Clear cache when new data is loaded
              delete this.groupedOptionsCache[category.id];
              // Initialize quantities for multiple options
              options.forEach(option => {
                if (option.multiple) {
                  this.optionQuantities[option.id] = this.optionQuantities[option.id] || 1;
                }
              });
            }
          });
        });
      },
      error: (err) => {
        console.error('Error fetching categories:', err);
      }
    });

    // Load entreprise data
    this.entrepriseService.getEntrepriseById(Number(this.cookieService.getEntrepriseId())).subscribe(e => {
      this.entreprise = e;
      const adr = this.entreprise.fct_adresse?.split('-');
      this.reservationForm.patchValue({
        nom: e.fct_nom ?? e.nom,
        rue: adr?.at(0) ?? '',
        codePostale: adr?.at(1) ?? '',
        ville: adr?.at(2) ?? '',
        telephone_standard: e.telephone_standard ?? '',
      });

      this.contactService.getContact(e.contact_principal_id ?? 9999).subscribe(c => {
        this.contactPrincipal = c;
        this.reservationForm.patchValue({
          nomResponsable: c.nom,
          prenomResponsable: c.prenom,
          telResponsable: c.telephone1,
          emailResponsable: c.email
        });
      });
    });
  }


  addOption2(option: Option2) {
    // For non-multiple options, quantity is always 1
    // For multiple options, use the selected quantity or default to 1
    const qty = option.multiple ? (this.optionQuantities[option.id] || 1) : 1;
    const color = ''; // No color selection needed

    console.log(`Adding option ${option.nom} with qty: ${qty}, multiple: ${option.multiple}`);

    // Special handling for standiste options (15, 21, 22) - only one can be selected
    if ([15, 21, 22].includes(option.id)) {
      // Remove any existing standiste option
      this.selectedOptions = this.selectedOptions.filter(so => ![15, 21, 22].includes(so.option2_id));
      // Clear the standiste form
      this.standisteForm.reset();
    }

    const commandeOption: Commande2Option = {
      commande2_id: 0, // Will be set when commande is created
      option2_id: option.id,
      qty: qty,
      color: '', // No color selection
      option_nom: option.nom,
      option_prix_ht: option.prix_ht,
      option_taux_tva: option.taux_tva
    };

    // Check if option already exists in selected options
    const existingIndex = this.selectedOptions.findIndex(so => so.option2_id === option.id);
    if (existingIndex >= 0) {
      // Replace the existing option with the new one (don't accumulate, just update)
      this.selectedOptions[existingIndex] = commandeOption;
    } else {
      this.selectedOptions.push(commandeOption);
    }

    console.log('Selected options:', this.selectedOptions);
  }

  removeOption2(optionId: number) {
    this.selectedOptions = this.selectedOptions.filter(so => so.option2_id !== optionId);

    // If removing a standiste option, clear the form
    if ([15, 21, 22].includes(optionId)) {
      this.standisteForm.reset();
    }
  }

  // Methods for grouped options (category ID 4 - Electricité, Internet, Elingues)
  getGroupedOptions(categoryId: number) {
    console.log('getGroupedOptions called with categoryId:', categoryId);
    console.log('Available categories:', this.option2Categories.map(c => `${c.id}: ${c.name}`));
    console.log('option2sByCategory keys:', Object.keys(this.option2sByCategory));

    if (categoryId !== 4) return [];

    if (this.groupedOptionsCache[categoryId]) {
      console.log('Returning cached grouped options:', this.groupedOptionsCache[categoryId]);
      return this.groupedOptionsCache[categoryId];
    }

    const options = this.option2sByCategory[categoryId] || [];
    console.log('Options for category 4:', options);

    const grouped: { [baseName: string]: Option2[] } = {};

    // Group options by base name (first word before space or dash)
    options.forEach(option => {
      const baseName = this.extractBaseName(option.nom);
      console.log(`Option "${option.nom}" grouped as "${baseName}"`);
      if (!grouped[baseName]) {
        grouped[baseName] = [];
      }
      grouped[baseName].push(option);
    });

    // Transform to array format for template
    const groupedArray = Object.keys(grouped).map(baseName => ({
      baseName: baseName,
      options: grouped[baseName],
      dropdownOptions: grouped[baseName].map(option => ({
        label: `${option.nom} - ${option.prix_ht} € HT`,
        value: option
      }))
    }));

    console.log('Grouped array result:', groupedArray);
    this.groupedOptionsCache[categoryId] = groupedArray;
    return groupedArray;
  }

  extractBaseName(optionName: string): string {
    // Extract base name from option name
    // Examples: "Electricité 3kW" -> "Electricité"
    //           "Internet - Standard" -> "Internet"
    //           "Elingues 2T" -> "Elingues"

    const patterns = [
      /^([A-Za-zàâäéèêëïîôöùûüÿç\s]+?)\s*[-–—]\s*/i,  // Match text before dash
      /^([A-Za-zàâäéèêëïîôöùûüÿç\s]+?)\s+\d/i,        // Match text before number
      /^([A-Za-zàâäéèêëïîôöùûüÿç\s]+?)\s+[A-Z]/i,      // Match text before uppercase
      /^([A-Za-zàâäéèêëïîôöùûüÿç\s]+)/i               // Fallback: take all text
    ];

    for (const pattern of patterns) {
      const match = optionName.match(pattern);
      if (match && match[1].trim().length > 2) {
        return match[1].trim();
      }
    }

    return optionName.trim();
  }

  onGroupOptionChange(groupName: string, event: any) {
    this.selectedGroupOptions[groupName] = event.value;

    // Initialize quantity for multiple options
    if (event.value && event.value.multiple) {
      this.optionQuantities[event.value.id] = this.optionQuantities[event.value.id] || 1;
    }
    // No color selection needed
  }

  addGroupedOption2(groupName: string) {
    const selectedOption = this.selectedGroupOptions[groupName];
    if (!selectedOption) return;

    // Use the existing addOption2 method
    this.addOption2(selectedOption);
  }

  getFirstImageOption(options: Option2[]): Option2 | null {
    // Find the first option that has an image
    return options.find(option => option.img && option.img.trim() !== '') || null;
  }

  getSelectedStandisteOption(): number | null {
    const standisteOption = this.selectedOptions.find(option =>
      [15, 21, 22].includes(option.option2_id)
    );
    return standisteOption ? standisteOption.option2_id : null;
  }

  canFinalizeOrder(): boolean {
    const reservationValid = this.reservationForm.valid;
    const standisteOptionId = this.getSelectedStandisteOption();

    // Always allow finalization if reservation is valid (commande can be empty)
    if (!reservationValid) {
      return false;
    }

    // No standiste option selected - allow empty commande
    if (standisteOptionId === null) {
      return true;
    }

    // Option 15 (no standiste) - no additional validation needed
    if (standisteOptionId === 15) {
      return true;
    }

    // Option 21 (project description) - require description if option selected
    if (standisteOptionId === 21) {
      return !!this.standisteForm.get('standiste_demande')?.value;
    }

    // Option 22 (standiste details) - require all standiste fields if option selected
    if (standisteOptionId === 22) {
      const standisteValid = !!(
        this.standisteForm.get('standiste_nom')?.value &&
        this.standisteForm.get('standiste_prenom')?.value &&
        this.standisteForm.get('standiste_telephone')?.value &&
        this.standisteForm.get('standiste_entreprise')?.value
      );
      return standisteValid;
    }

    return true;
  }

  calculateTotal(): number {
    let total = 0;
    this.selectedOptions.forEach(option => {
      total += (option.option_prix_ht || 0) * (option.qty || 1);
    });
    return total;
  }

  ngAfterViewChecked() {
     if (!this.canvasRef) {
    console.error('Canvas reference not found!');
    return;
  }
    console.log("after view init")
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.ctx.strokeStyle = 'rgb(66, 133, 244)'; // Blue pen color
    this.ctx.lineWidth = 3; // Pen width
    this.ctx.lineJoin = 'round'; // Join lines at corners
    this.ctx.lineCap = 'round'; // Line cap at end of stroke
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
      console.log('Mouse down event', event);

    const { offsetX, offsetY } = event;
    this.isDrawing = true;
    this.lastX = offsetX;
    this.lastY = offsetY;
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.isDrawing) return;
    const { offsetX, offsetY } = event;

    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(offsetX, offsetY);
    this.ctx.stroke();

    this.lastX = offsetX;
    this.lastY = offsetY;
  }

  @HostListener('mouseup')
  onMouseUp() {
    this.isDrawing = false;
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.isDrawing = false;
  }

 clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
  }

  showFactureDialog(): void {
    this.saveCanvas()
    // Save the signature before showing the dialog
   // this.savedSignature = this.canvasRef.nativeElement.toDataURL();
    console.log('Setting factureDialogVisible to true');
    this.factureDialogVisible = true;
    console.log('factureDialogVisible is now:', this.factureDialogVisible);
    // Force change detection to ensure dialog appears
    this.cdr.detectChanges();
  }

  async saveCanvas() {
    const dataUrl = this.canvasRef.nativeElement.toDataURL();
        console.log('Signature saved:', dataUrl);
    this.savedSignature = dataUrl;
    this.createBC2();
  }

  async createBC2() {
    this.updateEntreprise();
    this.updateContactPrincipal();

    const standisteOptionId = this.getSelectedStandisteOption();

    const commande2: Commande2 = {
      id: 0,
      entreprise_id: Number(this.cookieService.getEntrepriseId()),
      pack2_id: null,
      pack2_color: null,
      reduc_pct: 0,
      remise_pack_plus: null,
      valide: true,
      total_ht_avt_remise: this.calculateTotal(),
      total_ht: this.calculateTotal(),
      created: new Date(),
      modified: new Date(),
      standiste_nom: standisteOptionId === 22 ? this.standisteForm.get('standiste_nom')?.value : null,
      standiste_prenom: standisteOptionId === 22 ? this.standisteForm.get('standiste_prenom')?.value : null,
      standiste_entreprise: standisteOptionId === 22 ? this.standisteForm.get('standiste_entreprise')?.value : null,
      standiste_telephone: standisteOptionId === 22 ? this.standisteForm.get('standiste_telephone')?.value : null,
      standiste_demande: standisteOptionId === 21 ? this.standisteForm.get('standiste_demande')?.value : null,
      standiste_status: standisteOptionId || 0,
      validation_lieu: this.reservationForm.get('faitA')?.value
    };

    try {
      // 🔸 Step 1: Wait for PDF generation
      await this.factureBc2Dialog.generatedPdf("bc2", this.entreprise?.id + '_BC2', "contentToExport");

      // 🔸 Step 2: Create commande2 and wait
      const commandeResponse = await lastValueFrom(this.commande2Service.createCommande2(commande2));

      // 🔸 Step 3: Create all options in parallel and wait
      const optionObservables = this.selectedOptions.map(option =>
        this.commande2OptionsService.addOptionToCommande2({
          commande2_id: commandeResponse.id,
          option2_id: option.option2_id,
          qty: option.qty,
          color: option.color || undefined
        })
      );

      if (optionObservables.length > 0) {
        await lastValueFrom(forkJoin(optionObservables));
      }

      console.log('✅ Commande2 and all options created successfully');
      // Show success message and close dialog
      this.factureDialogVisible = false;
      // Navigate to recap page to show the final result
      this.router.navigate(['/entreprise/recap']);

    } catch (err) {
      console.error("❌ Error during BC2 creation", err);
    }
  }

  canProceedToNext(): boolean {
    const recapTabIndex = this.option2Categories.length;

    if (this.activeIndex < recapTabIndex) {
      // On a category tab - can always proceed (commande can be empty)
      return true;
    } else if (this.activeIndex === recapTabIndex) {
      // On Récapitulatif tab - always can proceed between categories and recap
      return true;
    }
    return false;
  }

  handleNext(): void {
    const recapTabIndex = this.option2Categories.length;

    if (this.activeIndex < recapTabIndex) {
      // On category tabs, move to next category or to Récapitulatif
      this.activeIndex++;
    } else if (this.activeIndex === recapTabIndex) {
      // On Récapitulatif tab - check if faitA field is filled before showing facture dialog
      const faitAValue = this.reservationForm.get('faitA')?.value;

      if (!faitAValue || faitAValue.trim() === '') {
        // Mark the field as touched to show validation error
        this.reservationForm.get('faitA')?.markAsTouched();
        return;
      }

      // If faitA is filled, show facture dialog
      console.log('Showing facture dialog...');
      console.log('Form valid:', this.reservationForm.valid);
      console.log('Form errors:', this.reservationForm.errors);
      this.showFactureDialog();
    }
  }

  handlePrevious(): void {
    if (this.activeIndex > 0) {
      this.activeIndex--;
    }
  }

  getTotalTabsCount(): number {
    return this.option2Categories.length + 1; // Categories + Récapitulatif
  }


  updateEntreprise() {
    if (this.reservationForm.touched && this.reservationForm.valid && this.entreprise) {
      this.entreprise.fct_adresse = this.reservationForm.get('rue')?.value + '-' +
        this.reservationForm.get('codePostale')?.value + '-' +
        this.reservationForm.get('ville')?.value;
      this.entreprise.fct_nom = this.reservationForm.get('nom')?.value;
      this.entreprise.telephone_standard = this.reservationForm.get('telephone_standard')?.value;
      this.entrepriseService.updateEntreprise(this.entreprise.id ?? 99999, this.entreprise).subscribe();
    }
  }

  updateContactPrincipal() {
    if (this.reservationForm.touched && this.contactPrincipal) {
      this.contactPrincipal.nom = this.reservationForm.get('nomResponsable')?.value;
      this.contactPrincipal.prenom = this.reservationForm.get('prenomResponsable')?.value;
      this.contactPrincipal.telephone1 = this.reservationForm.get('telResponsable')?.value;
      this.contactPrincipal.email = this.reservationForm.get('emailResponsable')?.value;
      this.contactService.updateContact(this.contactPrincipal.id ?? 9999, this.contactPrincipal).subscribe();
    }
  }
}
