import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  EventResponse,
  CreateEventRequest,
  UpdateEventRequest
} from '../../shared/models/event.models';

@Injectable({ providedIn: 'root' })
export class EventService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  listByGroup(groupId: number): Observable<EventResponse[]> {
    return this.http.get<EventResponse[]>(`${this.apiUrl}/groups/${groupId}/events`);
  }

  getById(id: number): Observable<EventResponse> {
    return this.http.get<EventResponse>(`${this.apiUrl}/events/${id}`);
  }

  create(groupId: number, body: CreateEventRequest): Observable<EventResponse> {
    return this.http.post<EventResponse>(`${this.apiUrl}/groups/${groupId}/events`, body);
  }

  update(id: number, body: UpdateEventRequest): Observable<EventResponse> {
    return this.http.put<EventResponse>(`${this.apiUrl}/events/${id}`, body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/events/${id}`);
  }
}
