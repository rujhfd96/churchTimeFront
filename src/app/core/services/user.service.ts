import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  UserResponse,
  CreateUserRequest,
  UpdateUserRequest,
  AssignUserGroupRequest
} from '../../shared/models/user.models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`;

  list(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(this.apiUrl);
  }

  getById(id: number): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/${id}`);
  }

  listByGroup(groupId: number): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${environment.apiUrl}/groups/${groupId}/users`);
  }

  create(body: CreateUserRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(this.apiUrl, body);
  }

  update(id: number, body: UpdateUserRequest): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.apiUrl}/${id}`, body);
  }

  assignGroup(id: number, body: AssignUserGroupRequest): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.apiUrl}/${id}/group`, body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  removeFromGroup(groupId: number, userId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/groups/${groupId}/users/${userId}`);
  }
}
