import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Commande1, Commande1Option } from '../../../models/commande1.model';
import { Option1 } from '../../../models/option1.model';
import { Entreprise } from '../../../../entreprise/entreprise.model';
import { Pack } from '../../../models/pack1.model';
import { ContactService } from '../../../models/contact.service';
import { Contact } from '../../../models/contact.model';
import { FileService } from '../../../../../core/services/file.service';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
interface CommandeWithEntreprise extends Commande1 {
  entreprise?: Entreprise,
  pack?: Pack,
  packDescription?: string,
  options?: Option1[]
}
@Component({
  selector: 'app-bc1-souscrit-facture',
  standalone: false,
  templateUrl: './bc1-souscrit-facture.component.html',
  styleUrl: './bc1-souscrit-facture.component.scss'
})
export class Bc1SouscritFactureComponent implements OnInit{
  
  @Input() modifyCommandeFact:CommandeWithEntreprise | undefined;
  @Input() modifyPackId: number | undefined;
  @Input() modifyPackOptions: any | undefined;
  @Input() modifyPackSurface: number | undefined;
  @Input() modificationsOptions: Option1[]=[];
  @Input() modifyTotalHt: number | undefined = 0
  @Input() modificationCommandeOption: Commande1Option[]=[];
  @Input() modificationContact: Contact | undefined;
  @Input() dateSolde: Date = new Date('2025-11-10'); // Default date
  contactEntreprise: Contact | undefined;
  @Output() envoyerFactureEvent = new EventEmitter<void>();
  today = new Date();
  visible = false
  

  constructor(private contactService: ContactService,private fileService: FileService){

  }

  ngOnInit(): void {

  }
    emitToParent() {
    this.envoyerFactureEvent.emit();
  }
  getPackChoisis(){

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

      // Wrap upload in a promise
      this.fileService.uploadFile(file, folder, filename).subscribe({
        next: () => {
          console.log('PDF uploaded successfully');
          resolve(); // ✅ Now resolve AFTER upload finishes
        },
        error: err => {
          console.error('PDF upload failed', err);
          reject(err);
        },
      });
    }).catch(err => {
      console.error('Error generating PDF:', err);
      reject(err);
    });
  });
}



  getDateAcompte(): Date {
    const today = new Date();
    let acompteDate = new Date(today);
    acompteDate.setDate(acompteDate.getDate() + 15);

    return acompteDate;
  }
}
