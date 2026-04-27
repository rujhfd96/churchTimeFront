# ChurchTime - Documentação Completa

## Visão Geral

**ChurchTime** (Church Presence MVP) é um backend em Java/Spring Boot para gerenciamento de presença em eventos de igrejas. O sistema organiza igrejas, grupos (células/ministérios), usuários e eventos com controle de check-in.

### Tech Stack

| Camada | Tecnologia |
|---|---|
| Linguagem | Java 21 |
| Framework | Spring Boot 3.4.5 |
| Banco de Dados | PostgreSQL 16 |
| ORM | Spring Data JPA (Hibernate) |
| Migrações | Flyway |
| Autenticação | JWT (HS256) + Spring Security |
| Mensageria | RabbitMQ |
| Build | Maven |
| Containerização | Docker Compose |
| Frontend esperado | Angular (localhost:4200) |

---

## Hierarquia de Dados

```
Church (1) ────< (N) Group (1) ────< (N) User
                        │                    │
                        │                    └───< (N) Presence
                        │                           ▲
                        └───< (N) Event ────────────┘
```

### Modelos

| Entidade | Tabela | Campos Principais |
|---|---|---|
| **Church** | `churches` | id, name, active, created_at |
| **Group** | `groups` | id, church_id, leader_id, name, description, active, created_at |
| **User** | `users` | id, group_id, name, email, password_hash, phone, role, active, created_at, updated_at |
| **Event** | `events` | id, group_id, title, location, event_date, status, created_at, reminded |
| **Presence** | `presences` | id, event_id, user_id, checked_in_at |

### Roles

| Role | Escopo |
|---|---|
| `ADMIN` | Acesso total a tudo |
| `LEADER` | CRUD nos grupos que lidera, eventos e presenças associadas |
| `MEMBER` | Check-in em eventos OPEN do seu grupo |

### Status de Evento

| Status | Significado |
|---|---|
| `SCHEDULED` | Evento agendado, ainda não aberto |
| `OPEN` | Evento aberto para check-in |
| `CLOSED` | Evento encerrado |

---

## Listagem Completa de Endpoints

### Autenticação (público)

| Método | Path | Descrição | Body | Resposta |
|---|---|---|---|---|
| `POST` | `/api/auth/login` | Login com email/senha | `{ email, password }` | `{ token }` |
| `POST` | `/api/auth/register` | Auto-registro (role=MEMBER) | `{ name, email, password, phone }` | `{ token }` |

---

### Igrejas (ADMIN)

| Método | Path | Descrição | Body | Auth |
|---|---|---|---|---|
| `POST` | `/api/churches` | Criar igreja | `{ name }` | ADMIN |
| `GET` | `/api/churches` | Listar igrejas ativas | — | ADMIN |
| `GET` | `/api/churches/{id}` | Buscar igreja por ID | — | ADMIN |
| `PUT` | `/api/churches/{id}` | Atualizar nome da igreja | `{ name }` | ADMIN |
| `DELETE` | `/api/churches/{id}` | Soft delete da igreja | — | ADMIN |

---

### Grupos (células/ministérios)

| Método | Path | Descrição | Body | Auth |
|---|---|---|---|---|
| `POST` | `/api/churches/{churchId}/groups` | Criar grupo | `{ name, description }` | ADMIN |
| `GET` | `/api/churches/{churchId}/groups` | Listar grupos da igreja | — | ADMIN, LEADER |
| `GET` | `/api/groups/{id}` | Buscar grupo por ID | — | ADMIN, LEADER |
| `PUT` | `/api/groups/{id}` | Atualizar grupo | `{ name, description }` | ADMIN |
| `PUT` | `/api/groups/{id}/leader` | Atribuir/remover líder | `{ leaderId }` | ADMIN |
| `DELETE` | `/api/groups/{id}` | Soft delete do grupo | — | ADMIN |

---

### Usuários

| Método | Path | Descrição | Body | Auth |
|---|---|---|---|---|
| `POST` | `/api/users` | Criar usuário | `{ name, email, password, phone, role, groupId }` | ADMIN |
| `GET` | `/api/users` | Listar usuários ativos | — | ADMIN |
| `GET` | `/api/users/{id}` | Buscar usuário por ID | — | ADMIN, LEADER |
| `GET` | `/api/groups/{groupId}/users` | Listar usuários do grupo | — | ADMIN, LEADER |
| `PUT` | `/api/users/{id}` | Atualizar usuário | `{ name, email, phone, role, groupId }` | ADMIN |
| `PUT` | `/api/users/{id}/group` | Mover usuário de grupo | `{ groupId }` | ADMIN |
| `DELETE` | `/api/users/{id}` | Soft delete do usuário | — | ADMIN |

---

### Eventos

| Método | Path | Descrição | Body | Auth |
|---|---|---|---|---|
| `POST` | `/api/groups/{groupId}/events` | Criar evento | `{ title, location, eventDate, status }` | ADMIN, LEADER |
| `GET` | `/api/groups/{groupId}/events` | Listar eventos do grupo | — | ADMIN, LEADER |
| `GET` | `/api/events/{id}` | Buscar evento por ID | — | ADMIN, LEADER |
| `PUT` | `/api/events/{id}` | Atualizar evento | `{ title, location, eventDate, status }` | ADMIN, LEADER |
| `DELETE` | `/api/events/{id}` | Deletar evento (hard delete) | — | ADMIN, LEADER |

---

### Presença / Check-in

| Método | Path | Descrição | Body | Auth |
|---|---|---|---|---|
| `POST` | `/api/events/{eventId}/checkin` | Fazer check-in no evento | `{}` (vazio) | MEMBER |
| `GET` | `/api/events/{eventId}/presences` | Listar presenças do evento | — | ADMIN, LEADER |

---

### Mensageria Admin (debug)

| Método | Path | Descrição | Body | Auth |
|---|---|---|---|---|
| `POST` | `/api/admin/messaging/events` | Publicar evento manualmente no RabbitMQ | `{ eventId }` | ADMIN |

---

## Guia Completo do Frontend (Angular + TypeScript)

### Stack do Frontend

| Camada | Tecnologia |
|---|---|
| Framework | Angular 18+ (standalone components) |
| Linguagem | TypeScript 5+ |
| UI | Angular Material ou Tailwind CSS |
| Estado | Signals (Angular 18+) ou RxJS |
| HTTP | `HttpClient` com interceptors |
| Formulários | Reactive Forms |
| Rotas | Angular Router com Guards |
| Build | Angular CLI (`ng serve`, `ng build`) |

---

### Estrutura de Pastas Sugerida

```
church-time-frontend/
├── src/
│   ├── app/
│   │   ├── core/                          # Singleton services
│   │   │   ├── interceptors/
│   │   │   │   └── auth.interceptor.ts    # Injeta JWT no Authorization header
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts          # Bloqueia rotas sem token
│   │   │   │   └── role.guard.ts          # Verifica role (ADMIN, LEADER, MEMBER)
│   │   │   └── services/
│   │   │       ├── auth.service.ts
│   │   │       ├── church.service.ts
│   │   │       ├── group.service.ts
│   │   │       ├── user.service.ts
│   │   │       ├── event.service.ts
│   │   │       └── presence.service.ts
│   │   ├── shared/                        # Componentes reutilizáveis
│   │   │   ├── components/
│   │   │   │   ├── header/
│   │   │   │   ├── sidebar/
│   │   │   │   ├── confirm-dialog/
│   │   │   │   └── loading-spinner/
│   │   │   ├── pipes/
│   │   │   │   ├── date-format.pipe.ts
│   │   │   │   └── role-label.pipe.ts
│   │   │   └── models/
│   │   │       ├── auth.models.ts
│   │   │       ├── church.models.ts
│   │   │       ├── group.models.ts
│   │   │       ├── user.models.ts
│   │   │       ├── event.models.ts
│   │   │       └── presence.models.ts
│   │   ├── features/                      # Páginas/rotas por feature
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   └── forgot-password/
│   │   │   ├── dashboard/
│   │   │   ├── churches/
│   │   │   │   ├── church-list/
│   │   │   │   ├── church-form/
│   │   │   │   └── church-detail/
│   │   │   ├── groups/
│   │   │   │   ├── group-list/
│   │   │   │   ├── group-form/
│   │   │   │   └── group-detail/
│   │   │   ├── users/
│   │   │   │   ├── user-list/
│   │   │   │   ├── user-form/
│   │   │   │   └── user-detail/
│   │   │   ├── events/
│   │   │   │   ├── event-list/
│   │   │   │   ├── event-form/
│   │   │   │   └── event-detail/
│   │   │   └── presence/
│   │   │       ├── checkin/
│   │   │       └── presence-list/
│   │   ├── app.routes.ts
│   │   └── app.config.ts
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   └── styles.scss
├── angular.json
├── package.json
└── tsconfig.json
```

---

### Interfaces TypeScript

```typescript
// auth.models.ts
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthResponse {
  accessToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

// user.models.ts
export type UserRole = 'ADMIN' | 'LEADER' | 'MEMBER';

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  groupId: number | null;
  groupName: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: UserRole;
  groupId?: number;
}

export interface UpdateUserRequest {
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  groupId?: number;
  password?: string;
}

export interface AssignUserGroupRequest {
  groupId: number;
}

// church.models.ts
export interface ChurchResponse {
  id: number;
  name: string;
  active: boolean;
  createdAt: string;
}

export interface CreateChurchRequest {
  name: string;
}

export interface UpdateChurchRequest {
  name: string;
}

// group.models.ts
export interface GroupResponse {
  id: number;
  churchId: number;
  leaderId: number | null;
  leaderName: string | null;
  name: string;
  description: string | null;
  active: boolean;
  createdAt: string;
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
}

export interface UpdateGroupRequest {
  name: string;
  description?: string;
}

export interface AssignLeaderRequest {
  leaderUserId: number | null;
}

// event.models.ts
export type EventStatus = 'SCHEDULED' | 'OPEN' | 'CLOSED';

export interface EventResponse {
  id: number;
  groupId: number;
  title: string;
  location: string | null;
  eventDate: string;
  status: EventStatus;
  createdAt: string;
}

export interface CreateEventRequest {
  title: string;
  location?: string;
  eventDate: string;
  status?: EventStatus;
}

export interface UpdateEventRequest {
  title: string;
  location?: string;
  eventDate: string;
  status?: EventStatus;
}

// presence.models.ts
export interface PresenceResponse {
  id: number;
  eventId: number;
  userId: number;
  userName: string;
  checkedInAt: string;
}
```

---

### Serviços (Services)

```typescript
// auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest
} from '../../shared/models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = `${environment.apiUrl}/auth`;

  login(body: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, body).pipe(
      tap(res => localStorage.setItem('token', res.accessToken))
    );
  }

  register(body: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, body).pipe(
      tap(res => localStorage.setItem('token', res.accessToken))
    );
  }

  forgotPassword(body: ForgotPasswordRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/forgot-password`, body);
  }

  resetPassword(body: ResetPasswordRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/reset-password`, body);
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

// church.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
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

// group.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
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

// user.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
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
}

// event.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
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

// presence.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
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
```

---

### Auth Interceptor

```typescript
// auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  let authReq = req;

  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: any) => {
      if (error.status === 401) {
        localStorage.removeItem('token');
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
```

---

### Guards de Rota

```typescript
// auth.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};

// role.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  role: string;
  sub: string;
  exp: number;
}

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  const decoded: JwtPayload = jwtDecode(token);
  const requiredRoles = route.data['roles'] as string[];

  if (requiredRoles && !requiredRoles.includes(decoded.role)) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
```

---

### Rotas

```typescript
// app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'churches',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        children: [
          { path: '', loadComponent: () => import('./features/churches/church-list/church-list.component').then(m => m.ChurchListComponent) },
          { path: 'new', loadComponent: () => import('./features/churches/church-form/church-form.component').then(m => m.ChurchFormComponent) },
          { path: ':id', loadComponent: () => import('./features/churches/church-detail/church-detail.component').then(m => m.ChurchDetailComponent) },
          { path: ':id/edit', loadComponent: () => import('./features/churches/church-form/church-form.component').then(m => m.ChurchFormComponent) }
        ]
      },
      {
        path: 'groups',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'LEADER'] },
        children: [
          { path: '', loadComponent: () => import('./features/groups/group-list/group-list.component').then(m => m.GroupListComponent) },
          { path: 'new', loadComponent: () => import('./features/groups/group-form/group-form.component').then(m => m.GroupFormComponent) },
          { path: ':id', loadComponent: () => import('./features/groups/group-detail/group-detail.component').then(m => m.GroupDetailComponent) }
        ]
      },
      {
        path: 'users',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        children: [
          { path: '', loadComponent: () => import('./features/users/user-list/user-list.component').then(m => m.UserListComponent) },
          { path: 'new', loadComponent: () => import('./features/users/user-form/user-form.component').then(m => m.UserFormComponent) },
          { path: ':id', loadComponent: () => import('./features/users/user-detail/user-detail.component').then(m => m.UserDetailComponent) }
        ]
      },
      {
        path: 'events',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'LEADER'] },
        children: [
          { path: '', loadComponent: () => import('./features/events/event-list/event-list.component').then(m => m.EventListComponent) },
          { path: 'new', loadComponent: () => import('./features/events/event-form/event-form.component').then(m => m.EventFormComponent) },
          { path: ':id', loadComponent: () => import('./features/events/event-detail/event-detail.component').then(m => m.EventDetailComponent) }
        ]
      },
      {
        path: 'presence',
        canActivate: [authGuard],
        children: [
          { path: 'checkin/:eventId', loadComponent: () => import('./features/presence/checkin/checkin.component').then(m => m.CheckinComponent) },
          { path: 'event/:eventId', loadComponent: () => import('./features/presence/presence-list/presence-list.component').then(m => m.PresenceListComponent) }
        ]
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
```

---

### Configuração do App

```typescript
// app.config.ts
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations()
  ]
};
```

```typescript
// environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

```typescript
// environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.churchtime.com.br/api'
};
```

---

### Padrões de UI/UX

| Componente | Descrição |
|---|---|
| **Login** | Formulário email + senha, link "Esqueceu a senha?", botão "Entrar" |
| **Register** | Formulário nome, email, senha, telefone (opcional) |
| **Forgot Password** | Formulário email, redireciona para página de reset após envio |
| **Reset Password** | Formulário código de 6 dígitos + nova senha + confirmação |
| **Dashboard** | Cards com métricas: total de grupos, eventos abertos, presenças recentes |
| **List Pages** | Tabela com colunas, botões de editar/deletar, botão "Novo", busca |
| **Form Pages** | Reactive Forms com validação, botão salvar/cancelar, loading state |
| **Detail Pages** | Visualização dos dados, botões de ação (editar, deletar) |
| **Header** | Logo, nome do usuário logado, botão logout |
| **Sidebar** | Navegação lateral com links por feature, visível conforme role |
| **Confirm Dialog** | Modal de confirmação para ações destrutivas (delete) |
| **Loading Spinner** | Overlay durante requisições HTTP |
| **Toast/Snackbar** | Notificações de sucesso/erro após operações |

---

### Fluxos de Tela por Role

**ADMIN:**
- Login → Dashboard → Sidebar completa (Churches, Groups, Users, Events, Presence)
- CRUD completo de tudo

**LEADER:**
- Login → Dashboard → Sidebar limitada (Groups que lidera, Events, Presence)
- CRUD de eventos e visualização de presenças dos seus grupos

**MEMBER:**
- Login → Dashboard → Sidebar mínima (Events, Check-in)
- Apenas check-in em eventos OPEN do seu grupo

---

### Tratamento de Erros

```typescript
// Exemplo de componente com tratamento de erro
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <mat-form-field>
        <mat-label>E-mail</mat-label>
        <input matInput formControlName="email" type="email">
      </mat-form-field>
      <mat-form-field>
        <mat-label>Senha</mat-label>
        <input matInput formControlName="password" type="password">
      </mat-form-field>
      <button mat-raised-button color="primary" type="submit" [disabled]="loading || form.invalid">
        {{ loading ? 'Entrando...' : 'Entrar' }}
      </button>
    </form>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  loading = false;

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;

    this.authService.login(this.form.value as any).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.loading = false;
        const msg = err.error?.message || 'Credenciais inválidas.';
        this.snackBar.open(msg, 'Fechar', { duration: 5000, panelClass: 'error-snackbar' });
      }
    });
  }
}
```

---

### Dependências npm Sugeridas

```bash
ng new church-time-frontend --standalone --routing --style=scss
cd church-time-frontend
ng add @angular/material
npm install jwt-decode
```

---

### Configuração do CORS

O backend já permite `http://localhost:4200`. Para produção, atualize o `SecurityConfig.java`:

```java
config.setAllowedOrigins(List.of(
  "http://localhost:4200",
  "https://app.churchtime.com.br"
));
```

---

### Documentação da API

Com o Swagger habilitado, o frontend pode consultar a documentação interativa em:

- **Swagger UI:** `http://localhost:8080/swagger-ui.html`
- **OpenAPI JSON:** `http://localhost:8080/v3/api-docs`

É possível gerar clients TypeScript automaticamente com `openapi-generator`:

```bash
npx @openapitools/openapi-generator-cli generate \
  -i http://localhost:8080/v3/api-docs \
  -g typescript-angular \
  -o ./src/app/core/generated
```

---

## O que falta para ser um SaaS sustentável

### 1. Multi-tenancy Real

**Problema:** O modelo atual assume uma única igreja gerenciada por um ADMIN global. Num SaaS, cada igreja é um tenant isolado.

**O que fazer:**
- Adicionar `tenant_id` em todas as tabelas ou usar schema por tenant
- Criar entidade `Organization`/`Tenant` que representa a igreja cliente do SaaS
- Administrador da igreja = `ORG_ADMIN` (diferente de `ADMIN` global da plataforma)
- Isolar dados: queries sempre filtrar por tenant
- Subdomínio por igreja (`igreja1.churchtime.com.br`)

---

### 2. Sistema de Assinatura / Pagamentos

**Problema:** Não existe nenhum mecanismo de cobrança.

**O que fazer:**
- Integração com gateway de pagamento (Stripe, Mercado Pago, Asaas)
- Planos: Gratuito (limitado), Pro, Enterprise
- Controle de assinatura por tenant (status, data de expiração, plano)
- Webhooks para pagamento recorrente, falha, cancelamento
- Bloqueio progressivo de funcionalidades quando assinatura expira
- Histórico de faturas/invoices
- Trial period (ex: 14 dias grátis)

---

### 3. Frontend

**Problema:** Não existe frontend. CORS está configurado para Angular em localhost:4200, mas nada foi construído.

**O que fazer:**
- Dashboard web responsivo (Angular, React ou Vue)
- App mobile (React Native, Flutter) ou PWA
- Páginas públicas de evento para check-in via QR Code
- Landing page de marketing + página de preços
- Portal de autoatendimento da igreja (cadastro sem intervenção manual)

---

### 4. Onboarding Self-Service

**Problema:** Igrejas não conseguem se cadastrar sozinhas. Tudo é feito via ADMIN.

**O que fazer:**
- Fluxo de cadastro completo: criar conta da igreja → configurar dados → convidar membros
- Wizard de onboarding com passos guiados
- Importação de membros via CSV/Excel
- Templates de eventos pré-configurados (culto domingo, ensaio, célula)

---

### 5. Autenticação e Segurança

**Problema:** JWT HS256 com secret configurável, sem refresh token, sem 2FA, sem recuperação de senha.

**O que fazer:**
- Refresh tokens com rotação
- Recuperação de senha por email (Spring Mail já está como dependência, mas não usado)
- Verificação de email no registro
- 2FA (TOTP)
- Rate limiting nos endpoints de autenticação
- Audit log (quem fez o quê e quando)
- Proteção contra brute force (bloqueio após N tentativas)
- Expirar sessões em mudança de senha

---

### 6. Notificações

**Problema:** Existe RabbitMQ para lembretes de eventos, mas não há consumidor real de notificações.

**O que fazer:**
- Notificações por email (confirmar check-in, lembrete de evento, resumo semanal)
- Notificações push (se houver app mobile)
- Notificações por WhatsApp/SMS (integração com Twilio ou similar)
- Template de emails customizáveis por igreja
- Preferências de notificação por usuário

---

### 7. Relatórios e Analytics

**Problema:** Não há nenhuma funcionalidade de relatórios.

**O que fazer:**
- Dashboard com métricas: frequência média, tendência, eventos mais frequentados
- Exportar relatórios em PDF/CSV
- Gráficos de presença ao longo do tempo
- Comparativo entre grupos/ministérios
- Métricas de engajamento por membro
- Relatório semanal/mensal automático por email para líderes

---

### 8. Funcionalidades de Evento

**Problema:** Eventos são básicos (título, local, data, status).

**O que fazer:**
- Eventos recorrentes (semanal, quinzenal, mensal)
- Capacidade máxima do evento (limite de vagas)
- Lista de espera
- Check-in por QR Code (gerar QR por evento, membro escaneia ou mostra QR pessoal)
- Check-in tardio com justificativa
- Categorias de evento (culto, célula, retiro, ensaio)
- Descrição longa do evento
- Anexos (arquivos, imagens)
- Feedback pós-evento (avaliação)

---

### 9. Gestão de Membros

**Problema:** Usuários são simples com nome, email, telefone e grupo.

**O que fazer:**
- Perfil completo do membro (foto, data de nascimento, endereço, data de batismo)
- Histórico de presença individual
- Tags/categorias de membros (novo, visitante, regular, líder)
- Fluxo de visitantes → membro efetivo
- Aniversariantes da semana
- Comunicação em massa para segmentos de membros

---

### 10. Infraestrutura e DevOps

**Problema:** Só existe docker-compose local, sem pipeline de CI/CD, sem monitoramento.

**O que fazer:**
- CI/CD (GitHub Actions, GitLab CI)
- Deploy em cloud (AWS, GCP, Render, Railway)
- Monitoramento e alertas (Sentry, Datadog, Grafana)
- Logging estruturado centralizado
- Health checks e readiness/liveness probes
- Backup automatizado do banco
- Variáveis de ambiente por ambiente (.env.example)
- Documentação de deploy
- Escalabilidade horizontal (stateless, connection pooling)

---

### 11. API e Integrações

**Problema:** API básica sem versionamento, sem documentação OpenAPI, sem webhooks.

**O que fazer:**
- Versionamento de API (`/api/v1/...`)
- Documentação OpenAPI/Swagger (springdoc-openapi)
- Webhooks para integrações externas (ex: notificar sistema da igreja quando alguém faz check-in)
- API pública com rate limiting e API keys
- SDK ou bibliotecas cliente

---

### 12. Testes

**Problema:** Só existe um teste básico de aplicação (`ChurchBackendApplicationTests`).

**O que fazer:**
- Testes unitários de services
- Testes de integração de controllers com MockMvc
- Testes de segurança (acesso negado para roles erradas)
- Testes de repositório
- Testes end-to-end
- Cobertura mínima de 80%

---

### 13. Funcionalidades Administrativas da Plataforma (Super Admin)

**Problema:** Não existe distinção entre admin da plataforma e admin da igreja.

**O que fazer:**
- Painel Super Admin para gerenciar todas as igrejas clientes
- Métricas da plataforma (total de igrejas, MRR, churn)
- Gestão de planos e assinaturas
- Suporte integrado (tickets)
- Feature flags para liberar funcionalidades por plano

---

### 14. Conformidade Legal (LGPD)

**Problema:** Nenhuma consideração de privacidade.

**O que fazer:**
- Consentimento explícito no registro
- Política de privacidade e termos de uso
- Exportação de dados pessoais do usuário
- Direito ao esquecimento (deleção completa)
- Registro de consentimento
- DPO contact

---

### 15. Internacionalização (i18n)

**Problema:** Mensagens de erro e dados em inglês, público-alvo é brasileiro.

**O que fazer:**
- Suporte a português brasileiro como idioma padrão
- Mensagens de erro localizadas
- Formatação de datas, horários e telefones no padrão BR
- Preparar estrutura para múltiplos idiomas

---

## Resumo de Prioridades

| Prioridade | Item | Esforço | Impacto |
|---|---|---|---|
| **P0** | Multi-tenancy | Alto | Crítico |
| **P0** | Frontend (web + mobile/PWA) | Alto | Crítico |
| **P0** | Sistema de pagamentos | Médio | Crítico |
| **P0** | Onboarding self-service | Médio | Crítico |
| **P1** | Recuperação de senha + verificação email | Baixo | Alto |
| **P1** | Notificações funcionais (email/push) | Médio | Alto |
| **P1** | Refresh tokens | Baixo | Alto |
| **P1** | Eventos recorrentes | Médio | Alto |
| **P1** | Relatórios básicos | Médio | Alto |
| **P2** | QR Code check-in | Médio | Médio |
| **P2** | Testes automatizados | Alto | Médio |
| **P2** | CI/CD + deploy cloud | Médio | Médio |
| **P2** | OpenAPI/Swagger | Baixo | Médio |
| **P2** | LGPD | Médio | Médio |
| **P3** | Analytics avançado | Alto | Baixo |
| **P3** | Webhooks e integrações | Médio | Baixo |
| **P3** | Internacionalização | Baixo | Baixo |
| **P3** | Super Admin dashboard | Médio | Baixo |

---

## Conclusão

O projeto atual é um **MVP funcional** com uma base sólida (Spring Boot, JWT, RabbitMQ, PostgreSQL). Porém, para se tornar um **SaaS sustentável**, precisa de transformações fundamentais:

1. **Arquitetura multi-tenant** — sem isso, não é SaaS
2. **Monetização** — sem pagamentos, não é sustentável
3. **Frontend** — sem interface, não é utilizável
4. **Self-service** — sem onboarding automático, não escala

O backend atual cobre bem o domínio de eventos e presença, mas precisa de ~15 grandes adições para competir no mercado de software para igrejas.
