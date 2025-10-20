import { Component, OnInit } from '@angular/core';
import { ExposantService } from '../../services/exposant.service';
import { Exposant } from '../../models/exposant.model';
import { ConfirmationService } from 'primeng/api';
import { BookService } from '../../services/book.service';
import { Entreprise } from '../../../entreprise/entreprise.model';
import { Book } from '../../models/book.model';
import { EntrepriseService } from '../../../entreprise/entreprise.service';
import { AuthCookieService } from '../../../../core/services/auth-cookie.service';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-gestion-exposants',
  standalone: false,
  templateUrl: './gestion-exposants.component.html',
  styleUrl: './gestion-exposants.component.scss'
})
export class GestionExposantsComponent implements OnInit {
  exposants: any[] = [];
  filteredExposants: any[] = [];
  showDialog: boolean = false;
  isEditMode: boolean = false;
  currentExposant: Exposant = {
    entreprise_id: 0,
    nom: '',
    prenom: '',
    fonction: ''
  };
  searchText: string = '';
  groupedExposants: { [key: string]: any[] } = {};
  pdfVisible: boolean = false
  pdfEntrepriseId: number | undefined
  pdfBookEntreprise: Book | undefined
  pdfExposants: any[] | undefined
  entreprises: Entreprise[] = [];
  selectedEntreprise: Entreprise | null = null;
  userRole: string = '';
  userId: number | null = null;

  constructor(
    private exposantService: ExposantService,
    private confirmationService: ConfirmationService,
    private bookService: BookService,
    private entrepriseService: EntrepriseService,
    private authCookieService: AuthCookieService
  ) {}

  ngOnInit(): void {
    this.userRole = this.authCookieService.getRole() ?? '';
    this.userId = Number(this.authCookieService.getUserId())
    this.loadExposants();
    this.loadEntreprises();
  }

  loadEntreprises(): void {
    this.entrepriseService.getAllEntreprises().subscribe({
      next: (data) => {
        // Filter enterprises based on role
        if (this.userRole === 'comm' && this.userId) {
          this.entreprises = data.filter(e => e.commercial_id === this.userId)
            .sort((a, b) => (a.nom || '').localeCompare(b.nom || ''));
        } else {
          this.entreprises = data.sort((a, b) =>
            (a.nom || '').localeCompare(b.nom || '')
          );
        }
      },
      error: (err) => console.error('Error loading entreprises:', err)
    });
  }

  loadExposants(): void {
    this.exposantService.getAllExposantsWithEntreprise().subscribe({
      next: (data) => {
        // Filter exposants based on role
        if (this.userRole === 'comm' && this.userId) {
          // For commercials, only show exposants from their assigned enterprises
          this.entrepriseService.getAllEntreprises().subscribe({
            next: (entreprises) => {
              const assignedEnterpriseIds = entreprises
                .filter(e => e.commercial_id === this.userId)
                .map(e => e.id);
              this.exposants = data.filter(exp =>
                assignedEnterpriseIds.includes(exp.entreprise_id)
              );
              this.applyFilter();
              this.groupByEntreprise();
            }
          });
        } else {
          this.exposants = data;
          this.applyFilter();
          this.groupByEntreprise();
        }
      },
      error: (err) => console.error('Error loading exposants:', err)
    });
  }

  applyFilter(): void {
    if (!this.searchText.trim()) {
      this.filteredExposants = [...this.exposants];
    } else {
      const search = this.searchText.toLowerCase();
      this.filteredExposants = this.exposants.filter(exp =>
        exp.nom.toLowerCase().includes(search) ||
        exp.prenom.toLowerCase().includes(search) ||
        exp.fonction.toLowerCase().includes(search) ||
        exp.entreprise_nom?.toLowerCase().includes(search) ||
        exp.entreprise_siret?.toLowerCase().includes(search)
      );
    }
    this.groupByEntreprise();
  }

  groupByEntreprise(): void {
    this.groupedExposants = {};
    this.filteredExposants.forEach(exp => {
      const entrepriseName = exp.entreprise_nom || 'Sans entreprise';
      if (!this.groupedExposants[entrepriseName]) {
        this.groupedExposants[entrepriseName] = [];
      }
      this.groupedExposants[entrepriseName].push(exp);
    });
  }

  getEntrepriseKeys(): string[] {
    return Object.keys(this.groupedExposants).sort();
  }

  openCreateDialog(): void {
    this.isEditMode = false;
    this.currentExposant = {
      entreprise_id: 0,
      nom: '',
      prenom: '',
      fonction: ''
    };
    this.selectedEntreprise = null;
    this.showDialog = true;
  }

  openEditDialog(exposant: any): void {
    this.isEditMode = true;
    this.currentExposant = {
      id: exposant.id,
      entreprise_id: exposant.entreprise_id,
      nom: exposant.nom,
      prenom: exposant.prenom,
      fonction: exposant.fonction
    };
    // Find and select the corresponding entreprise
    this.selectedEntreprise = this.entreprises.find(e => e.id === exposant.entreprise_id) || null;
    this.showDialog = true;
  }

  closeDialog(): void {
    this.showDialog = false;
  }

  onEntrepriseChange(): void {
    if (this.selectedEntreprise) {
      this.currentExposant.entreprise_id = this.selectedEntreprise.id || 0;
    }
  }

  saveExposant(): void {
    // Make sure the entreprise_id is set from the selected entreprise
    if (this.selectedEntreprise) {
      this.currentExposant.entreprise_id = this.selectedEntreprise.id || 0;
    }

    if (this.isEditMode && this.currentExposant.id) {
      this.exposantService.updateExposant(this.currentExposant.id, this.currentExposant).subscribe({
        next: () => {
          this.loadExposants();
          this.closeDialog();
        },
        error: (err) => console.error('Error updating exposant:', err)
      });
    } else {
      this.exposantService.createExposant(this.currentExposant).subscribe({
        next: () => {
          this.loadExposants();
          this.closeDialog();
        },
        error: (err) => console.error('Error creating exposant:', err)
      });
    }
  }

  deleteExposant(exposant: any): void {
    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir supprimer ${exposant.prenom} ${exposant.nom} ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.exposantService.deleteExposant(exposant.id).subscribe({
          next: () => this.loadExposants(),
          error: (err) => console.error('Error deleting exposant:', err)
        });
      }
    });
  }
  openPdfDialog(e:Exposant[]){
    this.pdfEntrepriseId = e[0].entreprise_id
    this.pdfVisible = true;
    this.pdfExposants = e;
    this.getBook();
  }
  private loadImageSize(dataUrl: string): Promise<{ width: number; height: number; aspectRatio: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
        aspectRatio: img.width / img.height
      });
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

async generateBadgesPdf() {
  if (!this.pdfExposants || this.pdfExposants.length === 0 || !this.pdfBookEntreprise) {
    console.error('No exposants or logo available for PDF generation');
    return;
  }

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // A4 dimensions: 210mm x 297mm
  const pageWidth = 210;
  const pageHeight = 297;
  const badgeWidth = 75;
  const badgeHeight = 55;
  const badgesPerRow = 2;
  const horizontalMargin = (pageWidth - (badgeWidth * badgesPerRow)) / 3; // Space between and around badges
  const verticalMargin = 10;
  let currentX = horizontalMargin;
  let currentY = verticalMargin;
  let badgeCount = 0;

  // Load logo image
  let logoDataUrl: string | null = null;
  let logoAspectRatio: number | null = null;

  if (this.pdfBookEntreprise.logo_url) {
    try {
      logoDataUrl = await this.loadImageAsDataUrl(this.pdfBookEntreprise.logo_url);
      const { aspectRatio } = await this.loadImageSize(logoDataUrl);
      logoAspectRatio = aspectRatio;
    } catch (err) {
      console.error('Error loading logo or calculating size:', err);
    }
  }

  for (let i = 0; i < this.pdfExposants.length; i++) {
    const exposant = this.pdfExposants[i];

    // Add new page if needed (except for first badge)
    if (badgeCount > 0 && badgeCount % 10 === 0) {
      pdf.addPage();
      currentX = horizontalMargin;
      currentY = verticalMargin;
    }

    // Draw badge border
    pdf.setDrawColor(200, 200, 200);
    pdf.rect(currentX, currentY, badgeWidth, badgeHeight);

    // Add logo if available
    if (logoDataUrl && logoAspectRatio) {
      const logoMaxWidth = badgeWidth * 0.7;
      const logoMaxHeight = badgeHeight * 0.45;

      // Calculate dimensions maintaining aspect ratio
      let logoWidth = logoMaxWidth;
      let logoHeight = logoWidth / logoAspectRatio;

      // If height exceeds max, scale based on height instead
      if (logoHeight > logoMaxHeight) {
        logoHeight = logoMaxHeight;
        logoWidth = logoHeight * logoAspectRatio;
      }

      const logoX = currentX + (badgeWidth - logoWidth) / 2;
      const logoY = currentY + 5;
      
      try {
        pdf.addImage(logoDataUrl, 'PNG', logoX, logoY, logoWidth, logoHeight);
      } catch (err) {
        console.error('Error adding logo to PDF:', err);
      }
    }

    // Add name (UPPERCASE) + first name (Capitalized)
    const nameY = currentY + (logoDataUrl ? 32 : 15);
    const fullName = `${exposant.nom.toUpperCase()} ${this.capitalize(exposant.prenom)}`;
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');

    // Center the name
    const nameWidth = pdf.getTextWidth(fullName);
    const nameX = currentX + (badgeWidth - nameWidth) / 2;
    pdf.text(fullName, nameX, nameY);

    // Add fonction
    const fonctionY = nameY + 6;
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');

    // Center the fonction
    const fonctionWidth = pdf.getTextWidth(exposant.fonction);
    const fonctionX = currentX + (badgeWidth - fonctionWidth) / 2;
    pdf.text(exposant.fonction, fonctionX, fonctionY);

    // Move to next position
    badgeCount++;
    currentX += badgeWidth + horizontalMargin;

    // Move to next row if needed
    if (badgeCount % badgesPerRow === 0) {
      currentX = horizontalMargin;
      currentY += badgeHeight + verticalMargin;
    }
  }

  // Save the PDF
  const entrepriseName = this.pdfExposants[0]?.entreprise_nom || 'Entreprise';
  pdf.save(`badges_${entrepriseName.replace(/\s+/g, '_')}.pdf`);
}


  private capitalize(text: string): string {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  private loadImageAsDataUrl(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0);

        try {
          const dataUrl = canvas.toDataURL('image/png');
          resolve(dataUrl);
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = url;
    });
  }
  getBook(){
  this.bookService.getByEntrepriseId(this.pdfEntrepriseId ?? -1).subscribe({
    next: (book) => {this.pdfBookEntreprise = book},
    error: (error) => {console.error(error);return}
  })
}
}
