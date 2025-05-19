import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from './../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class FileService {
  private apiUrl = `${environment.apiUrl}/api/upload`;


  constructor(private http: HttpClient) {}

  uploadFile(file: File, folder: string, filename?: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    let params = new HttpParams();
    if (filename) {
      params = params.set('filename', filename);
    }

    return this.http.post(`${this.apiUrl}/${folder}`, formData, { params });
  }
}
