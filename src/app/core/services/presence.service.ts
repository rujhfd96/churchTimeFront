import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PresenceResponse } from '../../shared/models/presence.models';

@Injectable({ providedIn: 'root' })
export class PresenceService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  checkIn(eventId: number): Observable<PresenceResponse> {
    return this.http.post<PresenceResponse>(`${this.apiUrl}/events/${eventId}/checkin`, {});
  }

  listByEvent(eventId: number): Observable<PresenceResponse[]> {
    return this.http.get<PresenceResponse[]>(`${this.apiUrl}/events/${eventId}/presences`);
  }
}
