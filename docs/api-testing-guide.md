# 🧪 Guia de Testes da API — Cookie Factory (Hoppscotch)

> Use **[Hoppscotch](https://hoppscotch.io)** ou **Postman** para testar os endpoints.
> Base URL: `http://localhost:3000/api/v1` (local) ou `http://<IP_EC2>/api/v1` (EC2)

---

## 🚀 Fluxo Completo de Teste (Passo a Passo)

### Pré-requisito: Rode o Seed

```bash
cd backend
npx prisma db seed
```

Credenciais criadas pelo seed:
| Tenant | Email | Senha |
|--------|-------|-------|
| Padaria do João | `admin@padaria.com` | `senha123` |
| Confeitaria da Maria | `admin@confeitaria.com` | `senha123` |

---

## 1️⃣ Health Check (sem auth)

```
GET /api/v1/health
```

**Resposta esperada (200):**
```json
{
  "data": {
    "service": "backend",
    "status": "ok",
    "timestamp": "2026-05-19T20:00:00.000Z"
  },
  "message": "Health check completed successfully"
}
```

---

## 2️⃣ Listar Tenants (sem auth)

```
GET /api/v1/tenants
```

**Resposta esperada (200):**
```json
{
  "data": [
    { "id": 1, "name": "Padaria do João", "cnpj": "11.111.111/0001-11", "status": "ACTIVE" },
    { "id": 2, "name": "Confeitaria da Maria", "cnpj": "22.222.222/0001-22", "status": "ACTIVE" }
  ],
  "message": "Tenants listados com sucesso"
}
```

---

## 3️⃣ Criar Novo Tenant (sem auth)

```
POST /api/v1/tenants
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Doceria Premium",
  "cnpj": "33.333.333/0001-33",
  "address": "Rua do Açúcar, 200 - Curitiba/PR"
}
```

---

## 4️⃣ Login — Tenant 1 (Padaria)

```
POST /api/v1/auth/login
Content-Type: application/json
```

**Body:**
```json
{
  "email": "admin@padaria.com",
  "password": "senha123"
}
```

**Resposta esperada (201):**
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "tenantId": 1,
      "name": "João Admin",
      "email": "admin@padaria.com"
    }
  },
  "message": "Login realizado com sucesso"
}
```

> ⚠️ **Copie o `accessToken`** — você usará nas próximas requisições.

---

## 5️⃣ Listar Produtos (com auth — Tenant 1)

```
GET /api/v1/products
Authorization: Bearer <TOKEN_DO_PASSO_4>
```

**Resposta esperada:** Apenas produtos da Padaria (PAD-001, PAD-002, PAD-003).

---

## 6️⃣ Criar Produto (com auth — Tenant 1)

```
POST /api/v1/products
Authorization: Bearer <TOKEN_DO_PASSO_4>
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Sonho de Creme",
  "description": "Sonho recheado com creme",
  "sku": "PAD-004"
}
```

---

## 7️⃣ Atualizar Produto (com auth)

```
PATCH /api/v1/products/1
Authorization: Bearer <TOKEN_DO_PASSO_4>
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Pão Francês Artesanal",
  "description": "Versão premium do pão francês"
}
```

---

## 8️⃣ Desativar Produto (soft delete)

```
DELETE /api/v1/products/1
Authorization: Bearer <TOKEN_DO_PASSO_4>
```

---

## 🔒 Teste de Isolamento Multi-Tenant

### 9️⃣ Login como Tenant 2 (Confeitaria)

```
POST /api/v1/auth/login
Content-Type: application/json
```

```json
{
  "email": "admin@confeitaria.com",
  "password": "senha123"
}
```

### 🔟 Listar Produtos com Token do Tenant 2

```
GET /api/v1/products
Authorization: Bearer <TOKEN_DO_TENANT_2>
```

**Resultado esperado:** Apenas CONF-001 e CONF-002 aparecem.
Os produtos da Padaria (PAD-*) **NÃO** devem aparecer!

### 1️⃣1️⃣ Tentar acessar produto do Tenant 1 com Token do Tenant 2

```
GET /api/v1/products/1
Authorization: Bearer <TOKEN_DO_TENANT_2>
```

**Resultado esperado:** `404 Not Found` — isolamento garantido!

---

## 👤 CRUD de Usuários (com auth)

### Criar Usuário

```
POST /api/v1/users
Authorization: Bearer <TOKEN>
Content-Type: application/json
```

```json
{
  "name": "Funcionário Teste",
  "email": "func@padaria.com",
  "password": "minhasenha123"
}
```

### Listar Usuários do Tenant

```
GET /api/v1/users
Authorization: Bearer <TOKEN>
```

---

## ❌ Testes de Erro

### Sem Token

```
GET /api/v1/products
```
**Resposta:** `401 Unauthorized` — "Token não fornecido"

### Token Inválido

```
GET /api/v1/products
Authorization: Bearer token_invalido_123
```
**Resposta:** `401 Unauthorized` — "Token inválido ou expirado"

### Body Inválido

```
POST /api/v1/products
Authorization: Bearer <TOKEN>
Content-Type: application/json

{ "description": "Sem nome e sem SKU" }
```
**Resposta:** `400 Bad Request` com lista de erros de validação.

---

## 📋 Resumo dos Endpoints

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/api/v1/health` | ❌ | Health check |
| `POST` | `/api/v1/tenants` | ❌ | Criar tenant |
| `GET` | `/api/v1/tenants` | ❌ | Listar tenants |
| `GET` | `/api/v1/tenants/:id` | ❌ | Buscar tenant |
| `PATCH` | `/api/v1/tenants/:id` | ❌ | Atualizar tenant |
| `DELETE` | `/api/v1/tenants/:id` | ❌ | Desativar tenant |
| `POST` | `/api/v1/auth/login` | ❌ | Login (retorna JWT) |
| `POST` | `/api/v1/users` | ✅ | Criar usuário |
| `GET` | `/api/v1/users` | ✅ | Listar usuários |
| `GET` | `/api/v1/users/:id` | ✅ | Buscar usuário |
| `PATCH` | `/api/v1/users/:id` | ✅ | Atualizar usuário |
| `POST` | `/api/v1/products` | ✅ | Criar produto |
| `GET` | `/api/v1/products` | ✅ | Listar produtos |
| `GET` | `/api/v1/products/:id` | ✅ | Buscar produto |
| `PATCH` | `/api/v1/products/:id` | ✅ | Atualizar produto |
| `DELETE` | `/api/v1/products/:id` | ✅ | Desativar produto |
