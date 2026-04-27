# ChurchTime - Documentação para o Frontend

## Visão Geral

Backend em Java 21 + Spring Boot 3.4.5 para gerenciamento de presença em eventos de igrejas.

### Tech Stack

| Camada | Tecnologia |
|---|---|
| Backend | Java 21 + Spring Boot 3.4.5 |
| Banco de Dados | PostgreSQL 16 (Flyway migrations) |
| Autenticação | JWT (HS256, 24h expiry) + Spring Security |
| Mensageria | RabbitMQ (producer only — consumer é serviço externo) |
| Frontend | Angular 18+ (localhost:4200) |
| API Docs | SpringDoc OpenAPI 2.8.5 (Swagger UI) |

### URL Base

- **Dev:** `http://localhost:8080/api`
- **Prod:** `https://api.churchtime.com.br/api`

### Autenticação

Todas as rotas (exceto login, registro, recuperação de senha e Swagger) exigem:

```
Authorization: Bearer <JWT_TOKEN>
```

Token retornado no campo `accessToken` do login/registro. Armazene em `localStorage`.

---

## Hierarquia de Dados

```
Church (1) ────< (N) Group (1) ────< (N) User
                        │                    │
                        │                    └───< (N) Presence
                        │                           ▲
                        └───< (N) Event ────────────┘
```

### Roles

| Role | O que pode fazer |
|---|---|
| `ADMIN` | Acesso total a tudo |
| `LEADER` | CRUD de eventos e presenças dos grupos que lidera; ver usuários dos seus grupos |
| `MEMBER` | Ver grupos da sua igreja, trocar de grupo, check-in em eventos OPEN do seu grupo |

### Status de Evento

| Status | Significado |
|---|---|
| `SCHEDULED` | Agendado, ainda não aberto |
| `OPEN` | Aberto para check-in |
| `CLOSED` | Encerrado |

---

## Endpoints da API

### Autenticação (público — sem token)

| Método | Path | Descrição | Body | Resposta |
|---|---|---|---|---|
| `POST` | `/api/auth/login` | Login | `{ email, password }` | `{ accessToken }` |
| `POST` | `/api/auth/register` | Auto-registro (role MEMBER) | `{ name, email, password, phone? }` | `{ accessToken }` (201) |
| `POST` | `/api/auth/forgot-password` | Solicitar código de 6 dígitos (15min) | `{ email }` | `200` (vazio) |
| `POST` | `/api/auth/reset-password` | Redefinir senha com código | `{ token, newPassword }` | `200` (vazio) |

### Dashboard (qualquer role autenticada)

| Método | Path | Descrição | Resposta |
|---|---|---|---|
| `GET` | `/api/dashboard/stats` | Estatísticas gerais (totalGroups, openEvents, activeMembers, todayCheckins) | `Map<String, Object>` |
| `GET` | `/api/dashboard/my-group` | Info do grupo do usuário atual (memberCount, activeEvents, leaderName) | `MyGroupResponse` |

### Igrejas (ADMIN)

| Método | Path | Descrição | Body | Status |
|---|---|---|---|---|
| `POST` | `/api/churches` | Criar igreja | `{ name }` | 201 |
| `GET` | `/api/churches` | Listar igrejas ativas | — | 200 |
| `GET` | `/api/churches/{id}` | Buscar igreja | — | 200 |
| `PUT` | `/api/churches/{id}` | Atualizar igreja | `{ name }` | 200 |
| `DELETE` | `/api/churches/{id}` | Soft delete | — | 204 |

### Grupos

| Método | Path | Auth | Descrição | Body | Status |
|---|---|---|---|---|---|
| `POST` | `/api/churches/{churchId}/groups` | ADMIN | Criar grupo | `{ name, description? }` | 201 |
| `GET` | `/api/churches/{churchId}/groups` | Qualquer autenticado | Listar grupos da igreja | — | 200 |
| `GET` | `/api/groups` | Qualquer autenticado | Listar grupos da igreja do usuário | — | 200 |
| `GET` | `/api/groups/my-church` | Qualquer autenticado | Alias para `/api/groups` | — | 200 |
| `GET` | `/api/groups/{id}` | ADMIN, LEADER ou MEMBER (mesma igreja) | Buscar grupo | — | 200 |
| `PUT` | `/api/groups/{id}` | ADMIN | Atualizar grupo | `{ name, description? }` | 200 |
| `PUT` | `/api/groups/{id}/leader` | ADMIN | Atribuir/remover líder | `{ leaderUserId }` (null remove) | 200 |
| `PUT` | `/api/groups/{id}/join` | MEMBER | Trocar de grupo (mesma igreja) | — | 200 |
| `DELETE` | `/api/groups/{id}` | ADMIN | Soft delete | — | 204 |

**Regras do join:**
- Apenas role `MEMBER`
- Membro já precisa ter um grupo associado
- Grupo de destino deve estar ativo e pertencer à mesma igreja

### Usuários

| Método | Path | Auth | Descrição | Body | Status |
|---|---|---|---|---|---|
| `POST` | `/api/users` | ADMIN | Criar usuário | `{ name, email, password, phone?, groupId? }` | 201 |
| `GET` | `/api/users` | ADMIN | Listar usuários ativos | — | 200 |
| `GET` | `/api/users/{id}` | ADMIN ou LEADER (escopo: grupos que lidera) | Buscar usuário | — | 200 |
| `GET` | `/api/groups/{groupId}/users` | ADMIN ou LEADER | Listar usuários do grupo | — | 200 |
| `PUT` | `/api/users/{id}` | ADMIN | Atualizar usuário | `{ name, email, phone?, role, password? }` | 200 |
| `PUT` | `/api/users/{id}/group` | ADMIN | Mover usuário de grupo | `{ groupId }` | 200 |
| `DELETE` | `/api/users/{id}` | ADMIN | Soft delete | — | 204 |

### Eventos (ADMIN, LEADER)

| Método | Path | Auth | Descrição | Body | Status |
|---|---|---|---|---|---|
| `POST` | `/api/groups/{groupId}/events` | ADMIN ou LEADER | Criar evento | `{ title, location?, eventDate, status? }` | 201 |
| `GET` | `/api/groups/{groupId}/events` | ADMIN, LEADER ou MEMBER (acesso ao grupo) | Listar eventos do grupo | — | 200 |
| `GET` | `/api/events/{id}` | ADMIN, LEADER ou MEMBER (mesmo grupo) | Buscar evento | — | 200 |
| `PUT` | `/api/events/{id}` | ADMIN ou LEADER | Atualizar evento | `{ title, location?, eventDate, status }` | 200 |
| `DELETE` | `/api/events/{id}` | ADMIN ou LEADER | Hard delete | — | 204 |

### Presença / Check-in

| Método | Path | Auth | Descrição | Body | Status |
|---|---|---|---|---|---|
| `POST` | `/api/events/{eventId}/checkin` | MEMBER | Check-in em evento OPEN do mesmo grupo | `{}` (vazio) | 201 |
| `GET` | `/api/events/{eventId}/presences` | ADMIN ou LEADER | Listar presenças do evento | — | 200 |

**Regras do check-in:**
- Apenas role `MEMBER`
- Evento deve estar com status `OPEN`
- Usuário deve pertencer ao mesmo grupo do evento
- Prevenção de duplicata (constraint unique user_id + event_id)

### Mensageria Admin (ADMIN)

| Método | Path | Descrição | Body | Status |
|---|---|---|---|---|
| `POST` | `/api/admin/messaging/events` | Publicar mensagem no RabbitMQ | `EventMessageDTO` | 204 |

---

## Interfaces TypeScript

```typescript
type UserRole = 'ADMIN' | 'LEADER' | 'MEMBER';
type EventStatus = 'SCHEDULED' | 'OPEN' | 'CLOSED';

// Auth
interface AuthResponse { accessToken: string }
interface LoginRequest { email: string; password: string }
interface RegisterRequest { name: string; email: string; password: string; phone?: string }
interface ForgotPasswordRequest { email: string }
interface ResetPasswordRequest { token: string; newPassword: string }

// Church
interface ChurchResponse { id: number; name: string; active: boolean; createdAt: string }

// Group
interface GroupResponse {
  id: number; churchId: number; leaderId: number | null;
  name: string; description: string | null; active: boolean; createdAt: string;
}
interface MyGroupResponse {
  id: number; name: string; description: string | null;
  leaderName: string | null; memberCount: number;
  activeEvents: number; active: boolean;
}

// User
interface UserResponse {
  id: number; groupId: number | null; name: string; email: string;
  phone: string | null; role: UserRole; active: boolean;
  createdAt: string; updatedAt: string;
}

// Event
interface EventResponse {
  id: number; groupId: number; title: string; location: string | null;
  eventDate: string; status: EventStatus; createdAt: string;
}

// Presence
interface PresenceResponse {
  id: number; userId: number; userName: string; checkedInAt: string;
}
```

---

## Fluxos de Tela por Role

**ADMIN:** Dashboard completo → CRUD de Churches, Groups, Users, Events, Presence

**LEADER:** Dashboard → Groups que lidera, Events, Presence (apenas dos seus grupos)

**MEMBER:** Dashboard → Ver grupos da igreja (`GET /api/groups/my-church`), trocar de grupo (`PUT /api/groups/{id}/join`), check-in em eventos OPEN do seu grupo, info do seu grupo (`GET /api/dashboard/my-group`)

---

## Recuperação de Senha

1. `POST /api/auth/forgot-password` → envia código de 6 dígitos por e-mail (válido por 15min)
2. `POST /api/auth/reset-password` → valida código e redefine senha
3. Redirecionar para `/password-reset-success`

---

## CORS

| Setting | Value |
|---|---|
| Allowed Origins | `http://localhost:4200` |
| Allowed Methods | GET, POST, PUT, DELETE, OPTIONS |
| Allowed Headers | `*` |
| Allow Credentials | `true` |

---

## Swagger

Com o backend rodando:

- **Swagger UI:** `http://localhost:8080/swagger-ui.html`
- **OpenAPI JSON:** `http://localhost:8080/v3/api-docs`

Gerar clients TypeScript automaticamente:

```bash
npx @openapitools/openapi-generator-cli generate \
  -i http://localhost:8080/v3/api-docs \
  -g typescript-angular \
  -o ./src/app/core/generated
```

---

## Roadmap

| Prioridade | Item | Esforço | Impacto |
|---|---|---|---|
| **P0** | Multi-tenancy | Alto | Crítico |
| **P0** | Frontend (web + mobile/PWA) | Alto | Crítico |
| **P0** | Sistema de pagamentos | Médio | Crítico |
| **P0** | Onboarding self-service | Médio | Crítico |
| **P1** | Verificação de email no registro | Baixo | Alto |
| **P1** | Refresh tokens | Baixo | Alto |
| **P1** | Eventos recorrentes | Médio | Alto |
| **P1** | Relatórios básicos | Médio | Alto |
| **P2** | QR Code check-in | Médio | Médio |
| **P2** | Testes automatizados | Alto | Médio |
| **P2** | CI/CD + deploy cloud | Médio | Médio |
| **P2** | LGPD | Médio | Médio |
