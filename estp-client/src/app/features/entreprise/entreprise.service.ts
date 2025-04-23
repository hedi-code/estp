import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthCookieService } from '../../core/services/auth-cookie.service';
import { Entreprise } from './entreprise.model';
import { environment } from './../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class EntrepriseService {
  private apiUrl = `${environment.apiUrl}/api/entreprises`; // adjust base URL if needed

  constructor(private http: HttpClient, private cookieService: AuthCookieService) {}

  getAllEntreprises(): Observable<Entreprise[]> {
    return this.http.get<Entreprise[]>(this.apiUrl);
  }

  getEntrepriseById(id: number): Observable<Entreprise> {
    return this.http.get<Entreprise>(`${this.apiUrl}/${id}`);
  }
  
  getEntrepriseByUserId(): Observable<Entreprise> {
    return this.http.get<Entreprise>(`${this.apiUrl}/user/${this.cookieService.getUserId()}`);
  }

  createEntreprise(entreprise: Entreprise): Observable<Entreprise> {
    return this.http.post<Entreprise>(this.apiUrl, entreprise);
  }

  updateEntreprise(id: number, entreprise: Entreprise): Observable<Entreprise> {
    return this.http.put<Entreprise>(`${this.apiUrl}/${id}`, entreprise);
  }

  deleteEntreprise(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
