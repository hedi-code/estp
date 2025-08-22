import { Component } from '@angular/core';
import { Book } from '../../models/book.model';
import { BookService } from '../../services/book.service';
import { environment } from '../../../../../environments/environment';
import { FileService } from '../../../../core/services/file.service';

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


  constructor(private bookService: BookService, private fileService: FileService) {}

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
      this.selectedBook.logo_url = 'logos/'+this.selectedFile.name
      this.fileService.uploadFile(this.selectedFile,'logos',newName).subscribe()
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
}