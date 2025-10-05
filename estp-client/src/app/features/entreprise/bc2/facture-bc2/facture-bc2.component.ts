import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Entreprise } from '../../entreprise.model';
import { Contact } from '../../../forum/models/contact.model';
import { Commande2Option } from '../../../forum/models/commande2.model';
import { FileService } from '../../../../core/services/file.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-facture-bc2',
  standalone: false,
  templateUrl: './facture-bc2.component.html',
  styleUrl: './facture-bc2.component.scss'
})
export class FactureBc2Component implements OnInit {

  @Input() entreprise: Entreprise | undefined;
  @Input() contactPrincipal: Contact | undefined;
  @Input() selectedOptions: Commande2Option[] = [];
  @Input() standisteForm: FormGroup | undefined;
  @Input() reservationForm: FormGroup | undefined;
  @Input() signature: any;
  @Input() fait: string | undefined;
  @Input() prixTotal: number = 0;
  @Input() showButton: boolean = true;
  @Output() createBc2Event = new EventEmitter<void>();
    @Input() nomFichierBc2: string | undefined;


  today: Date = new Date();

  constructor(private fileService: FileService) { }

  ngOnInit() {
  }

  emitToParent() {
    this.createBc2Event.emit();
  }

  generatedPdf(folder: string, filename: string, contentId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const element = document.getElementById(contentId);
        if (!element) {
          console.error(`Element #${contentId} not found!`);
          return;
        }

        html2canvas(element, {
          scale: 2,
          useCORS: true,
          allowTaint: false,
          backgroundColor: '#ffffff'
        }).then(canvas => {
          const imgData = canvas.toDataURL('image/jpeg');
          const imgOriginalWidth = canvas.width;
          const imgOriginalHeight = canvas.height;
          const pdfWidth = imgOriginalWidth;
          const pdfHeight = imgOriginalHeight;

          const pdf = new jsPDF({
            unit: 'px',
            format: [pdfWidth, pdfHeight],
          });

          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
          const pdfBlob = pdf.output('blob');
          const file = new File([pdfBlob], `${filename}.pdf`, { type: 'application/pdf' });

          this.fileService.uploadFile(file, folder, filename).subscribe({
            next: () => console.log('PDF uploaded successfully'),
            error: err => console.error('PDF upload failed', err),
          });
        }).catch(err => {
          console.error('Error generating PDF:', err);
        });
        resolve()
      } catch (error) {
        console.error(error);
        reject(error);
      }
    })
  }

  getDateAcompte(): Date {
    const today = new Date();
    let acompteDate = new Date(today);
    acompteDate.setDate(acompteDate.getDate() + 15);
    return acompteDate;
  }

  getSelectedStandisteOption(): number | null {
    const standisteOption = this.selectedOptions.find(option =>
      [15, 21, 22].includes(option.option2_id)
    );
    return standisteOption ? standisteOption.option2_id : null;
  }

  getCompanyInfo() {
    if (!this.reservationForm) return null;
    return {
      nom: this.reservationForm.get('nom')?.value,
      adresse: `${this.reservationForm.get('rue')?.value} ${this.reservationForm.get('codePostale')?.value} ${this.reservationForm.get('ville')?.value}`,
      telephone: this.reservationForm.get('telephone_standard')?.value
    };
  }

  getResponsableInfo() {
    if (!this.reservationForm) return null;
    return {
      nom: `${this.reservationForm.get('prenomResponsable')?.value} ${this.reservationForm.get('nomResponsable')?.value}`,
      email: this.reservationForm.get('emailResponsable')?.value,
      telephone: this.reservationForm.get('telResponsable')?.value
    };
  }

  // Filter out standiste options (IDs: 15, 21, 22)
  getFilteredOptions() {
    return this.selectedOptions.filter(option =>
      ![15, 21, 22].includes(option.option2_id)
    );
  }

  calculateTotalHT(): number {
    let total = 0;
    this.getFilteredOptions().forEach(option => {
      total += (option.option_prix_ht || 0) * (option.qty || 1);
    });
    return total;
  }

  calculateTotalTTC(): number {
    return this.calculateTotalHT() + this.calculateTVA();
  }

  calculateTVA(): number {
    let totalTVA = 0;
    this.getFilteredOptions().forEach(option => {
      const prixHT = (option.option_prix_ht || 0) * (option.qty || 1);
      const tauxTVA = (option.option_taux_tva || 20) / 100; // Default to 20% if not set

      // Debug log to check what TVA values we're getting
      if (option.option_taux_tva === undefined || option.option_taux_tva === null || option.option_taux_tva === 0) {
        console.log(`Option ${option.option_nom} has no TVA set, using default 20%`, option);
      }

      totalTVA += prixHT * tauxTVA;
    });
    return totalTVA;
  }

  // Group options by TVA rate
  getTVAGroups(): any[] {
    const groups: { [key: number]: any } = {};

    this.getFilteredOptions().forEach(option => {
      const tauxTVA = option.option_taux_tva || 20;
      const prixHT = (option.option_prix_ht || 0) * (option.qty || 1);
      const montantTVA = prixHT * (tauxTVA / 100);

      if (!groups[tauxTVA]) {
        groups[tauxTVA] = {
          taux: tauxTVA,
          totalHT: 0,
          totalTVA: 0,
          totalTTC: 0
        };
      }

      groups[tauxTVA].totalHT += prixHT;
      groups[tauxTVA].totalTVA += montantTVA;
      groups[tauxTVA].totalTTC += prixHT + montantTVA;
    });

    return Object.values(groups).sort((a, b) => a.taux - b.taux);
  }
}