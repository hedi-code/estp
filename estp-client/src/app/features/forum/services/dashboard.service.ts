import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { BookService } from './book.service';
import { Commande1Service } from './commande1.service';
import { Commande2Service } from './commande2.service';

export interface DashboardStats {
  totalBooks: number;
  totalBc1: number;
  totalBc2: number;
  totalBc1Amount: number;
  totalBc2Amount: number;
  totalEntreprises: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/api`;

  constructor(
    private http: HttpClient,
    private bookService: BookService,
    private commande1Service: Commande1Service,
    private commande2Service: Commande2Service
  ) { }

  getDashboardStats(): Observable<DashboardStats> {
    return forkJoin({
      books: this.bookService.getAll(),
      commandes1: this.commande1Service.getAllCommande1s(),
      commandes2: this.commande2Service.getAllCommande2s(),
      entreprises: this.http.get<any[]>(`${this.apiUrl}/user`)
    }).pipe(
      map(({ books, commandes1, commandes2, entreprises }) => {
        console.log('Commandes1 data:', commandes1);
        console.log('Commandes2 data:', commandes2);

        const totalBc1Amount = commandes1.reduce((sum, cmd) => {
          const amount = Number(cmd.total_ht) || 0;
          console.log(`BC1 ${cmd.id}: ${amount}`);
          return sum + amount;
        }, 0);

        const totalBc2Amount = commandes2.reduce((sum, cmd) => {
          const amount = Number(cmd.total_ht) || 0;
          console.log(`BC2 ${cmd.id}: ${amount}`);
          return sum + amount;
        }, 0);

        console.log('Total BC1 Amount:', totalBc1Amount);
        console.log('Total BC2 Amount:', totalBc2Amount);

        const totalEntreprises = entreprises.filter(user => user.role === 'comm' || user.entreprise).length;

        return {
          totalBooks: books.length,
          totalBc1: commandes1.length,
          totalBc2: commandes2.length,
          totalBc1Amount,
          totalBc2Amount,
          totalEntreprises
        };
      })
    );
  }
}
