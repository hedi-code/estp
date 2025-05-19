import { Component, ElementRef, HostListener, OnInit, signal, ViewChild } from '@angular/core';
import { Pack1Service } from '../../forum/services/pack1.service';
import { environment } from './../../../../environments/environment';
import { Pack } from '../../forum/models/pack1.model';
import { CommandeService } from '../commande/commande.service';
import { Option1 } from '../../forum/models/option1.model';
import { Option1Service } from '../../forum/services/option1.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EntrepriseService } from '../entreprise.service';
import { AuthCookieService } from '../../../core/services/auth-cookie.service';
import { Entreprise } from '../entreprise.model';
import { ContactService } from '../../forum/models/contact.service';
import { Contact } from '../../forum/models/contact.model';
import { Commande1Service } from '../../forum/services/commande1.service';
import { Commande1 } from '../../forum/models/commande1.model';
import { FileService } from '../../../core/services/file.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FactureBc1Component } from './facture-bc1/facture-bc1.component';
import { Commande1OptionsService } from '../../forum/services/commande1-options.service';
import { take } from 'rxjs';



@Component({
  selector: 'app-bc1',
  standalone: false,
  templateUrl: './bc1.component.html',
  styleUrl: './bc1.component.scss'
})
export class Bc1Component implements OnInit {
  activeIndex: number = 0;
  baseUrl: String = environment.apiUrl
  pack1s: Pack[] = []
  options: Option1[] = [];  // Store options here
  optionQuantities: { [key: number]: number } = {};
  selectedOption: any;
  isDisabled = true
  savedSignature: any;
  visible = false;
  reservationForm!: FormGroup;
  entreprise: Entreprise | undefined;
  contactPrincipal: Contact | undefined;
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('factureBc1') factureBc1!: FactureBc1Component;

  private ctx!: CanvasRenderingContext2D;
  private isDrawing = false;
  private lastX = 0;
  private lastY = 0;



  constructor(private commande1OptionService: Commande1OptionsService, private commande1Service: Commande1Service, private fb: FormBuilder, private pack1Service: Pack1Service, private commandeService: CommandeService, private option1Service: Option1Service, private entrepriseService: EntrepriseService, private cookieService: AuthCookieService, private contactService: ContactService) { }

  ngOnInit() {
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
    }); this.pack1Service.getAllPacks().subscribe({
      next: (response) => {
        this.pack1s = response;
        console.log(this.pack1s)

      },
      error: (err) => {
        console.log(err)
      }
    })
    // Fetch options when the component is initialized
    this.option1Service.getAllOptions().subscribe({
      next: (data) => {
        this.options = data;  // Assign data to options array
        this.options.forEach(option => {
          if ([94, 105, 106, 107, 108, 109, 113, 114].includes(option.id)) {
            this.optionQuantities[option.id] = 1;
          }
        });
      },
      error: (err) => {
        console.error('Error fetching options:', err);
      }
    });

    this.entrepriseService.getEntrepriseById(Number(this.cookieService.getEntrepriseId())).subscribe(e => {
      this.entreprise = e
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
      })
    });


  }

  addBtnIsDisabled() {
    return !!!this.selectedOption
  }

  addToCommand(pack: Pack, surface: any) {
    this.commandeService.addPack(pack, surface.surface_id);
    this.isDisabled = false;

  }
  addOption(id: any, qte: any) {
    let option: Option1 | undefined = this.options.find(o => o.id === id);
    if (option) { option.qteCommande = qte ? qte : 1 }
    if (!!option) {
      this.commandeService.addOption(option);
    }
  }

  updateEntreprise() {
    if (this.reservationForm.touched && this.reservationForm.get('rue')?.value &&
      this.reservationForm.get('telephone_standard')?.value &&
      this.reservationForm.get('nom')?.value &&
      this.reservationForm.get('ville')?.value &&
      this.reservationForm.get('codePostale')?.value) {
      if (!!this.entreprise) {
        this.entreprise.fct_adresse = this.reservationForm.get('rue')?.value + '-' +
          this.reservationForm.get('codePostale')?.value + '-' +
          this.reservationForm.get('ville')?.value
        this.entreprise.fct_nom = this.reservationForm.get('nom')?.value
        this.entrepriseService.updateEntreprise(this.entreprise?.id ?? 99999, this.entreprise).subscribe();
      }
    }
  }

  updateContactPrincipal() {
    if (
      this.reservationForm.touched && this.reservationForm.get('nomResponsable')?.value &&
      this.reservationForm.get('prenomResponsable')?.value &&
      this.reservationForm.get('telResponsable')?.value &&
      this.reservationForm.get('emailResponsable')?.value
    ) {
      if (!!this.contactPrincipal) {
        this.contactPrincipal.nom = this.reservationForm.get('nomResponsable')?.value;
        this.contactPrincipal.telephone1 = this.reservationForm.get('telResponsable')?.value;
        this.contactPrincipal.prenom = this.reservationForm.get('prenomResponsable')?.value;
        this.contactPrincipal.email = this.reservationForm.get('emailResponsable')?.value;
        this.contactService.updateContact(this.contactPrincipal.id ?? 9999, this.contactPrincipal).subscribe()
      }
    }
  }






  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.ctx.strokeStyle = 'rgb(66, 133, 244)'; // Blue pen color
    this.ctx.lineWidth = 3; // Pen width
    this.ctx.lineJoin = 'round'; // Join lines at corners
    this.ctx.lineCap = 'round'; // Line cap at end of stroke
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    const { offsetX, offsetY } = event;
    this.isDrawing = true;
    this.lastX = offsetX;
    this.lastY = offsetY;
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.isDrawing) return;
    const { offsetX, offsetY } = event;

    // Draw on the canvas
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

  saveCanvas() {
    const dataUrl = this.canvasRef.nativeElement.toDataURL();
    console.log('Signature saved:', dataUrl);
    if (this.entreprise) {
      this.entreprise.telephone_standard = this.reservationForm.get('telephone_standard')?.value;
      this.entreprise.nom = this.reservationForm.get('nom')?.value
      this.entreprise.adresse = this.reservationForm.get('rue')?.value + '-' + this.reservationForm.get('codePostale')?.value + '-' + this.reservationForm.get('ville')?.value
    }
    this.visible = true
    this.savedSignature = dataUrl
  }

  getOffreOption(offre: string) {
    return offre.split('+');
  }
 async createBC1() {
  this.updateEntreprise();
  this.updateContactPrincipal();

  this.commandeService.commandeBs.pipe(take(1)).subscribe(async c => {
    const cm: Commande1 = {
      entreprise_id: Number(this.cookieService.getEntrepriseId()),
      reduc_pct: 0,
      reduc_lin: 0,
      pack1_id: c.surfacePrix,
      valide: false,
      total_ht: this.commandeService.getPrice(),
      total_ht_avt_remise: this.commandeService.getPrice(),
      validation_lieu: this.reservationForm.get('faitA')?.value,
      id: 0,
      created: new Date(),
      modified: new Date()
    };

    try {
      // 🔸 Ensure PDF is generated BEFORE proceeding
      await this.factureBc1.generatedPdf("bc1", this.entreprise?.id + '_BC1', "contentToExport");
      console.log("PDF generated");

      // 🔸 Only runs after PDF is done
      this.commande1Service.createCommande1(cm).subscribe({
        next: (response) => {
          c.option.forEach(op => {
            this.commande1OptionService.createCommande1Option({
              option1_id: op.id,
              qty: op.qteCommande ?? 1,
              commande1_id: response.id
            }).subscribe();
          });
        },
        error: (err) => {
          console.error("Erreur lors de la création de commande1", err);
        }
      });
    } catch (err) {
      console.error("Erreur lors de la génération du PDF", err);
    }
  });
}
  fakeSubmit() {
    console.log("form submitted")
  }
}
