import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ChurchResponse,
  CreateChurchRequest,
  UpdateChurchRequest
} from '../../shared/models/church.models';

@Injectable({ providedIn: 'root' })
export class ChurchService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/churches`;

  list(): Observable<ChurchResponse[]> {
    return this.http.get<ChurchResponse[]>(this.apiUrl);
  }

  getById(id: number): Observable<ChurchResponse> {
    return this.http.get<ChurchResponse>(`${this.apiUrl}/${id}`);
  }

  create(body: CreateChurchRequest): Observable<ChurchResponse> {
    return this.http.post<ChurchResponse>(this.apiUrl, body);
  }

  update(id: number, body: UpdateChurchRequest): Observable<ChurchResponse> {
    return this.http.put<ChurchResponse>(`${this.apiUrl}/${id}`, body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
