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
  selectedUser!: User


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
      next: (data) => (this.books = data || []),
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
          const url = `${this.baseUrl}/api/uploads/${b.logo_url}`;
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
    this.entrepriseService.getEntrepriseById(book.entreprise_id).subscribe({
      next: (entreprise) => {
         this.userService.getUserById(entreprise.user_id ?? -1).subscribe(
          user => this.selectedUser = user
        )
      }
    })
  }

  sendBat(){
    if(this.selectedFile){

      this.emailService.sendEmailWithAttachment({
        senderEmail: 'ne-pas-repondre@forumestp.fr',
        receiverEmail: "hedibensafegine7@gmail.com  ",
        receiverName: "hedi",
        subject: 'azer',
        htmlText: 'azer',
        file: this.selectedFile 
      }).subscribe();
    }
  }
}