import { Component } from '@angular/core';
import { Book } from '../../models/book.model';
import { BookService } from '../../services/book.service';
import { environment } from '../../../../../environments/environment';
import { FileService } from '../../../../core/services/file.service';
import { saveAs } from 'file-saver'; // npm install file-saver
import * as Papa from 'papaparse';   // npm install papaparse
import JSZip from 'jszip';  
import { EmailService } from '../../../../core/services/email.service';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { EntrepriseService } from '../../../entreprise/entreprise.service';

@Component({
  selector: 'app-gestion-book',
  standalone: false,
  templateUrl: './gestion-book.component.html',
  styleUrl: './gestion-book.component.scss'
})
export class GestionBookComponent {
    baseUrl: String = environment.apiUrl

  books: Book[] = [];
  selectedBook!: Book;
  displayEditDialog = false;
  displayDeleteDialog = false;
  selectedFile: File | null = null;
  selectedUser!: User;
  displayBatDialog = false;


  constructor(
    private bookService: BookService, 
    private fileService: FileService, 
    private emailService: EmailService,
    private userService: UserService,
    private entrepriseService: EntrepriseService
  ) {}

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks() {
    this.bookService.getAll().subscribe({
      next: (data) => {
        this.books = data || []
        this.books.forEach(book => {
          this.entrepriseService.getEntrepriseById(book.entreprise_id).subscribe(entreprise => {
            this.books[this.books.findIndex(book => book.entreprise_id == entreprise.id)].entreprise_nom = entreprise.nom
          })
        })
        
      },
      error: (e) => console.error(e),
    });
  }

  onEdit(book: Book) {
    // clone object to avoid two-way binding on table
    this.selectedBook = { ...book };
    this.displayEditDialog = true;
  }

  saveBook() {
    if (!this.selectedBook) return;
    if(this.selectedFile?.name){
        const originalName = this.selectedFile?.name ?? '';
    let extension = originalName.includes('.') ? originalName.split('.').pop() : '';
    let newName = originalName.includes(extension ?? '') ? originalName.split('.').reverse().pop() : this.selectedFile?.name
      this.selectedBook.logo_url = `${this.baseUrl}/api/uploads/logos/${this.selectedBook.entreprise_id}.${extension}`;
      this.fileService.uploadFile(this.selectedFile,'logos',`${this.selectedBook.entreprise_id}`).subscribe()
    }
    this.bookService.update(this.selectedBook.id!, this.selectedBook).subscribe({
      next: () => {
        this.displayEditDialog = false;
        this.loadBooks();
      },
      error: (e) => console.error(e),
    });
  }

  onDelete(book: Book) {
    this.selectedBook = book;
    this.displayDeleteDialog = true;
  }

  confirmDelete() {
    if (!this.selectedBook) return;
    this.bookService.delete(this.selectedBook.id!).subscribe({
      next: () => {
        this.displayDeleteDialog = false;
        this.loadBooks();
      },
      error: (e) => console.error(e),
    });
  }

  cancelDelete() {
    this.displayDeleteDialog = false;
  }
    onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.selectedBook.logo_url = URL.createObjectURL(file); // preview
    }
  }

    async exportBooksToCSV() {
    if (!this.books || this.books.length === 0) return;

    // Convert books to CSV
    const csv = Papa.unparse(this.books, {
      header: true,
      skipEmptyLines: true,
    });

    // Prepare zip archive
    const zip = new JSZip();
    zip.file("books.csv", csv);

    // Download logos
    const logoFolder = zip.folder("logos");

    for (const b of this.books) {
      if (b.logo_url) {
        try {
          const url = `${b.logo_url}`;
          const response = await fetch(url);
          if (response.ok) {
            const blob = await response.blob();
            const fileName = b.logo_url.split('/').pop() || `logo_${b.id}.png`;
            logoFolder?.file(fileName, blob);
          }
        } catch (err) {
          console.error("Erreur téléchargement logo", b.logo_url, err);
        }
      }
    }

    // Generate zip
    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, "books_export.zip");
    });
  }

  openBatDialog(book: Book){
    this.selectedBook = {...book};
    this.selectedFile = null; // Reset selected file
    this.displayBatDialog = true;
    this.entrepriseService.getEntrepriseById(book.entreprise_id).subscribe({
      next: (entreprise) => {
         this.userService.getUserById(entreprise.user_id ?? -1).subscribe(
          user => this.selectedUser = user
        )
      }
    })
  }

  sendBat(){
    if (!this.selectedFile) {
      alert('Veuillez sélectionner un fichier BAT');
      return;
    }

    this.entrepriseService.getEntrepriseById(this.selectedBook.entreprise_id).subscribe({
      next: (entreprise) => {
         this.userService.getUserById(entreprise.user_id ?? -1).subscribe({
          next: (user) => {
            this.selectedUser = user;
            // Send email with book details
            this.emailService.sendEmailWithAttachment({
              senderEmail: 'ne-pas-repondre@forumestp.fr',
              //receiverEmail: "hedibensafegine7@gmail.com",
              receiverEmail: user.email || "hedibensafegine7@gmail.com",
              ccEmails: ['chloe.denier@forumestp.fr'],
              receiverName: `${user.first_name} ${user.last_name}`,
              subject: `Bon à tirer - Page de Book ${entreprise.nom}`,
              htmlText: `
                <p>Bonjour,</p>
                <br>
                <p>Suite au remplissage de votre fiche signalétique, nous avons pu compléter votre page de présentation dans le Book.</p>
                <br>
                <p>Vous trouverez le Bon à Tirer ci-joint.</p>
                <br>
                <p>Dans le cas où l'une des sections n'est pas remplie, vous avez la possibilité de nous communiquer le texte correspondant.</p>
                <br>
                <p>Si vous avez d'autres remarques, merci de nous faire un retour par mail sous un délai de 48h (jours ouvrés) à partir de la réception du mail.</p>
                <br>
                <p>Si aucune réponse n'est donnée avant le dépassement du délai, nous considérerons que la page de Book est validée.</p>
                <br>
                <p>Notez que le nom de l'entreprise indiquée dans le Book sera utilisé comme référence pour l'ensemble de la communication de l'événement.</p>
                <br>
                <p>En attendant un retour de votre part, nous vous remercions d'avance pour votre attention et nous vous souhaitons une bonne journée.</p>
                <br>
                <p>Bien cordialement,</p>
              `,
              file: this.selectedFile!
            }).subscribe({
              next: () => {
                this.displayBatDialog = false;
                this.selectedFile = null;
              },
              error: (error) => {
                console.error('Erreur lors de l\'envoi de l\'email:', error);
              }
            });
          },
          error: (error) => {
            console.error('Erreur lors de la récupération de l\'utilisateur:', error);
          }
         });
      },
      error: (error) => {
        console.error('Erreur lors de la récupération de l\'entreprise:', error);
      }
    });
  }

  onBatFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }
}