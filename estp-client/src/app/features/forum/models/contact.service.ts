import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Contact } from './contact.model';
import { AuthCookieService } from '../../../core/services/auth-cookie.service';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private baseUrl = 'http://localhost:3000/api/contact'; // Change as needed

  constructor(private http: HttpClient,private cookieService:AuthCookieService) {}

  getAllContacts(): Observable<Contact[]> {
    return this.http.get<Contact[]>(this.baseUrl);
  }

  getContact(id: number): Observable<Contact> {
    return this.http.get<Contact>(`${this.baseUrl}/${id}`);
  }
  getContactByUserId(): Observable<Contact[]> {
    return this.http.get<Contact[]>(`${this.baseUrl}/user/${this.cookieService.getUserId()}`);
  }

  createContact(contact: Contact): Observable<Contact> {
    return this.http.post<Contact>(this.baseUrl, contact);
  }

  updateContact(id: number, contact: Contact): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, contact);
  }

  deleteContact(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
