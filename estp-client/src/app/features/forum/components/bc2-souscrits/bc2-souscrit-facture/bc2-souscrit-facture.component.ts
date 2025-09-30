import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Commande2, Commande2Option } from '../../../models/commande2.model';
import { Option2 } from '../../../models/commande2.model';
import { Entreprise } from '../../../../entreprise/entreprise.model';
import { ContactService } from '../../../models/contact.service';
import { Contact } from '../../../models/contact.model';
import { FileService } from '../../../../../core/services/file.service';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface CommandeWithEntreprise extends Commande2 {
  entreprise?: Entreprise;
  options?: Option2[];
}

@Component({
  selector: 'app-bc2-souscrit-facture',
  standalone: false,
  templateUrl: './bc2-souscrit-facture.component.html',
  styleUrl: './bc2-souscrit-facture.component.scss'
})
export class Bc2SouscritFactureComponent implements OnInit {

  @Input() modifyCommandeFact: CommandeWithEntreprise | undefined;
  @Input() modificationsOptions: Option2[] = [];
  @Input() modifyTotalHt: number | undefined = 0;
  @Input() modificationCommandeOption: Commande2Option[] = [];
  @Input() modificationContact: Contact | undefined;
  @Input() signature: any;
  @Input() fait: string | undefined;

  contactEntreprise: Contact | undefined;
  @Output() envoyerFactureEvent = new EventEmitter<void>();
  today = new Date();
  visible = false;

  customDateAcompte: Date = new Date();
  customDateSolde: Date = new Date(2025, 10, 25);

  constructor(
    private contactService: ContactService,
    private fileService: FileService
  ) {}

  ngOnInit(): void {
  }

  emitToParent() {
    this.envoyerFactureEvent.emit();
  }

  generatedPdf(folder: string, filename: string, contentId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const element = document.getElementById(contentId);
      if (!element) {
        console.error(`Element #${contentId} not found!`);
        reject('Element not found');
        return;
      }

      html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff'
      }).then(canvas => {
        const imgData = canvas.toDataURL('image/jpeg');
        const pdfWidth = canvas.width;
        const pdfHeight = canvas.height;

        const pdf = new jsPDF({
          unit: 'px',
          format: [pdfWidth, pdfHeight],
          compress: true
        });

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        const pdfBlob = pdf.output('blob');
        const file = new File([pdfBlob], `${filename}.pdf`, { type: 'application/pdf' });

        // Upload PDF to backend
        this.fileService.uploadFile(file, folder, filename).subscribe({
          next: () => {
            console.log('BC2 PDF uploaded successfully');
            resolve();
          },
          error: err => {
            console.error('BC2 PDF upload failed', err);
            reject(err);
          },
        });
      }).catch(err => {
        console.error('Error generating BC2 PDF:', err);
        reject(err);
      });
    });
  }


  // Filter out standiste options (IDs: 15, 21, 22)
  getFilteredOptions(): Commande2Option[] {
    return this.modificationCommandeOption.filter(option =>
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
      const tauxTVA = (option.option_taux_tva || 20) / 100; // Use option_taux_tva or default to 20%
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

  getCompanyInfo() {
    if (!this.modifyCommandeFact?.entreprise) return null;
    const entreprise = this.modifyCommandeFact.entreprise;
    const adresse = entreprise.fct_adresse ? entreprise.fct_adresse.split('-') : [];

    return {
      nom: entreprise.fct_nom || entreprise.nom,
      adresse: adresse.length >= 3 ? `${adresse[0]} ${adresse[1]} ${adresse[2]}` : (entreprise.adresse || ''),
      telephone: entreprise.telephone_standard
    };
  }

  getResponsableInfo() {
    if (!this.modificationContact) return null;
    return {
      nom: `${this.modificationContact.prenom || ''} ${this.modificationContact.nom || ''}`.trim(),
      email: this.modificationContact.email,
      telephone: this.modificationContact.telephone1
    };
  }




}