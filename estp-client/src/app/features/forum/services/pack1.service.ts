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
  createPack(data: Pack) { return this.http.post(`${this.apiUrl}`, data); }
  updatePack(id: number, data: Pack) { return this.http.put(`${this.apiUrl}/pack/${id}`, data); }
  deletePack(id: number) { return this.http.delete(`${this.apiUrl}}/pack/${id}`); }

  // Options
  createOption(data: any) { return this.http.post(`${this.apiUrl}/pack/options`, data); }
  updateOption(id: number, data: any) { return this.http.put(`${this.apiUrl}/pack/options/${id}`, data); }
  deleteOption(id: number) { return this.http.delete(`${this.apiUrl}/pack/options/${id}`); }

  // Surfaces
  createSurface(data: any) { return this.http.post(`${this.apiUrl}/pack/surfaces`, data); }
  updateSurface(id: number, data: any) { return this.http.put(`${this.apiUrl}/pack/surfaces/${id}`, data); }
  deleteSurface(id: number) { return this.http.delete(`${this.apiUrl}/pack/surfaces/${id}`); }
}
