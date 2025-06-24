import { Injectable } from '@angular/core';
import { environment } from './../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface SendInvoicePayload {
  senderEmail: string;
  receiverEmail: string;
  receiverName: string;
  subject: string;
  htmlText: string;
  ccEmails?: string[];
  attachmentName: string; // e.g. "123_BC1.pdf"
}

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private apiUrl = `${environment.apiUrl}/api/email`;

  constructor(private http: HttpClient) {}

  sendInvoice(payload: SendInvoicePayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/send-invoice`, payload);
  }
}