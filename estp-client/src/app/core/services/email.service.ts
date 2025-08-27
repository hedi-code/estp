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
interface SendEmailWithAttachmentPayload {
  senderEmail: string;
  receiverEmail: string;
  receiverName: string;
  subject: string;
  htmlText: string;
  ccEmails?: string[];
  file: File; // actual File instead of just filename
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
  
   sendEmailWithAttachment(payload: SendEmailWithAttachmentPayload): Observable<any> {
    const formData = new FormData();
    formData.append('senderEmail', payload.senderEmail);
    formData.append('receiverEmail', payload.receiverEmail);
    formData.append('receiverName', payload.receiverName);
    formData.append('subject', payload.subject);
    formData.append('htmlText', payload.htmlText);

    if (payload.ccEmails) {
      formData.append('ccEmails', JSON.stringify(payload.ccEmails));
    }

    formData.append('file', payload.file, payload.file.name);

    return this.http.post(`${this.apiUrl}/send-email-with-attachment`, formData);
  }
}