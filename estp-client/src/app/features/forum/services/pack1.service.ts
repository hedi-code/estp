import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from './../../../../environments/environment';
import { Pack } from './../models/pack1.model'

@Injectable({
  providedIn: 'root'
})
export class Pack1Service {
  private apiUrl = `${environment.apiUrl}/api/pack1`;


  constructor(private http: HttpClient) {}

  // Method to fetch all packs
  getAllPacks(): Observable<Pack[]> {
    return this.http.get<Pack[]>(this.apiUrl);
  }
}
