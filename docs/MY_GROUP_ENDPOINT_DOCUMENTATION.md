# Endpoint: GET /api/dashboard/my-group

## Visão Geral
Endpoint que retorna informações do grupo ao qual o usuário logado está vinculado, incluindo contagem de membros e eventos ativos.

---

## Endpoint
```
GET /api/dashboard/my-group
```

### Autenticação
- **Obrigatório:** Sim
- **Header:** `Authorization: Bearer <jwt_token>`
- O usuário é identificado automaticamente pelo token JWT (claim `sub` = email)

### Request
```
GET http://localhost:8080/api/dashboard/my-group
Headers:
  Authorization: Bearer <seu_token_jwt>
  Content-Type: application/json
```

Sem body ou query params.

---

## Response

### Sucesso (200 OK)
```json
{
  "id": 1,
  "name": "Célula Jovens",
  "description": "Grupo de jovens da igreja",
  "leaderName": "João Silva",
  "memberCount": 12,
  "activeEvents": 2,
  "active": true
}
```

#### Schema da Resposta
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | `number` | ID do grupo |
| `name` | `string` | Nome do grupo |
| `description` | `string \| null` | Descrição do grupo (pode ser null) |
| `leaderName` | `string \| null` | Nome do líder do grupo (pode ser null se não houver líder) |
| `memberCount` | `number` | Total de membros ativos no grupo |
| `activeEvents` | `number` | Total de eventos com status `OPEN` do grupo |
| `active` | `boolean` | Se o grupo está ativo |

### Erros

| Status | Quando | Ação do Frontend |
|--------|--------|-----------------|
| `401` | Token ausente ou inválido | Redirecionar para login |
| `404` | Usuário não tem grupo vinculado | Exibir "Nenhum grupo atribuído" |
| `500` | Erro interno | Exibir mensagem genérica de erro |

---

## Exemplo de Uso (JavaScript/Fetch)

```javascript
async function fetchMyGroup() {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch('http://localhost:8080/api/dashboard/my-group', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (response.status === 401) {
    // Token inválido - redirecionar para login
    window.location.href = '/login';
    return null;
  }
  
  if (response.status === 404) {
    // Usuário sem grupo
    return null;
  }
  
  if (!response.ok) {
    throw new Error(`Erro ${response.status}`);
  }
  
  return await response.json();
}

// Exemplo de uso
fetchMyGroup()
  .then(group => {
    if (group) {
      document.getElementById('groupName').textContent = group.name;
      document.getElementById('memberCount').textContent = group.memberCount;
      document.getElementById('activeEvents').textContent = group.activeEvents;
      if (group.leaderName) {
        document.getElementById('leaderName').textContent = group.leaderName;
      }
    } else {
      document.getElementById('myGroup').textContent = 'Nenhum grupo atribuído';
    }
  })
  .catch(error => {
    console.error('Erro ao buscar grupo:', error);
  });
```

---

## Observações Técnicas

1. **Dados calculados em tempo real:**
   - `memberCount`: Conta usuários onde `group_id = X AND active = true`
   - `activeEvents`: Conta eventos onde `group_id = X AND status = 'OPEN'`

2. **Campos nullable:**
   - `description` pode ser `null` se o grupo não tiver descrição
   - `leaderName` pode ser `null` se o grupo não tiver líder atribuído

3. **Acessível por qualquer role:** ADMIN, LEADER ou MEMBER

---

## Testando com cURL

```bash
curl -X GET \
  http://localhost:8080/api/dashboard/my-group \
  -H 'Authorization: Bearer SEU_TOKEN_AQUI' \
  -H 'Content-Type: application/json'
```

---

## Implementação Backend

### Arquivos modificados/criados:

1. **GroupDtos.java** - Adicionado record `MyGroupResponse`:
   ```java
   public record MyGroupResponse(
       Long id,
       String name,
       String description,
       String leaderName,
       long memberCount,
       long activeEvents,
       boolean active
   ) {}
   ```

2. **UserRepository.java** - Adicionado método:
   ```java
   @Query("SELECT COUNT(u) FROM User u WHERE u.group.id = :groupId AND u.active = true")
   int countByGroupIdAndActiveTrue(@Param("groupId") Long groupId);
   ```

3. **EventRepository.java** - Adicionado método:
   ```java
   @Query("SELECT COUNT(e) FROM Event e WHERE e.group.id = :groupId AND e.status = :status")
   int countByGroupIdAndStatus(@Param("groupId") Long groupId, @Param("status") EventStatus status);
   ```

4. **DashboardController.java** - Adicionado endpoint `GET /api/dashboard/my-group`

---

## Integração com o Frontend

### Quando chamar:
- Ao carregar a seção "Meu Grupo" do dashboard
- Após o usuário trocar de grupo (para atualizar os dados)

### Estados de UI recomendados:
- **Loading:** Enquanto aguarda resposta
- **Dados:** Exibir nome, descrição, líder, contagem de membros e eventos
- **Sem grupo:** Exibir mensagem "Nenhum grupo atribuído" (quando 404)
- **Erro:** Exibir mensagem genérica (quando 500)
