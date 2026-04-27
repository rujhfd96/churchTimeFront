import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  GroupResponse,
  CreateGroupRequest,
  UpdateGroupRequest,
  AssignLeaderRequest
} from '../../shared/models/group.models';

@Injectable({ providedIn: 'root' })
export class GroupService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  listByChurch(churchId: number): Observable<GroupResponse[]> {
    return this.http.get<GroupResponse[]>(`${this.apiUrl}/churches/${churchId}/groups`);
  }

  getById(id: number): Observable<GroupResponse> {
    return this.http.get<GroupResponse>(`${this.apiUrl}/groups/${id}`);
  }

  create(churchId: number, body: CreateGroupRequest): Observable<GroupResponse> {
    return this.http.post<GroupResponse>(`${this.apiUrl}/churches/${churchId}/groups`, body);
  }

  update(id: number, body: UpdateGroupRequest): Observable<GroupResponse> {
    return this.http.put<GroupResponse>(`${this.apiUrl}/groups/${id}`, body);
  }

  assignLeader(id: number, body: AssignLeaderRequest): Observable<GroupResponse> {
    return this.http.put<GroupResponse>(`${this.apiUrl}/groups/${id}/leader`, body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/groups/${id}`);
  }
}
