import { Component, effect, EventEmitter, Input, OnInit, Output, signal, Signal } from '@angular/core';
import { Entreprise } from '../../entreprise.model';
import { Commande, CommandeService } from '../../commande/commande.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FileService } from '../../../../core/services/file.service';

@Component({
  selector: 'app-facture-bc1',
  standalone: false,
  templateUrl: './facture-bc1.component.html',
  styleUrl: './facture-bc1.component.scss'
})
export class FactureBc1Component implements OnInit {

  @Input() commande1: any;
  @Input() signature: any;
  @Input() contactPrincipal: any;
  @Input() entreprise: Entreprise | undefined;

  @Input() commercial: any;
  @Input() config: any;
  @Input() nomFichierBc1: string | undefined;


  today: Date = new Date();
  commande: Commande | undefined;
  surfacePrix: any;
  prixTotal: number = 0;
  @Input() showButton: boolean = true;
  @Output() createBc1Event = new EventEmitter<void>();


  constructor(private fileService: FileService, private commandeService: CommandeService) { }

  ngOnInit() {
    this.commandeService.commandeBs.subscribe(c => {
      this.commande = c;
      this.surfacePrix = this.commande?.pack?.surfaces?.find(s => s.surface_id == this.commande?.surfacePrix)
    })
    this.commandeService.prixTotal.subscribe(p => this.prixTotal = p)
  }
emitToParent(){
      this.createBc1Event.emit();
}
  generatedPdf(folder: string, filename: string, contentId: string):Promise<void> {

  return new Promise((resolve, reject) => {

      const element = document.getElementById(contentId);
      if (!element) {
        console.error(`Element #${contentId} not found!`);
        return;
      }

      html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');

        const imgOriginalWidth = canvas.width;
        const imgOriginalHeight = canvas.height;

        // Define max width for the PDF page (in px)

        // Calculate scale factor to fit the content width inside maxPdfWidth

        const pdfWidth = imgOriginalWidth;
        const pdfHeight = imgOriginalHeight;

        // Create jsPDF instance with calculated dimensions
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

  })
  }
}