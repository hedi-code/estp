import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Config } from '../models/config.model';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllConfigs(): Observable<Config[]> {
    return this.http.get<Config[]>(`${this.apiUrl}/api/config`);
  }

  getConfigByName(configName: string): Observable<Config> {
    return this.http.get<Config>(`${this.apiUrl}/api/config/${configName}`);
  }

  updateConfig(id: number, config: Partial<Config>): Observable<any> {
    return this.http.put(`${this.apiUrl}/api/config/${id}`, config);
  }

  uploadConfigFile(configName: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('config_name', configName);
    return this.http.post(`${this.apiUrl}/api/config/upload`, formData);
  }
}
