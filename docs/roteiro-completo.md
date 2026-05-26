# 🍪 Cookie Factory — Roteiro Completo da Prática

## Do Código ao Servidor: Monolito Modular NestJS → Testes → CI/CD → EC2

> **Para quem é este documento?**
> - **Professor:** roteiro de preparação pré-aula + condução da live de 30 min
> - **Aluno:** guia de estudo com os dois pilares da prática

---

## 📐 Visão Geral dos Dois Pilares

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  PILAR 1: LÓGICA & VALIDAÇÃO              PILAR 2: INFRAESTRUTURA
│  ─────────────────────────                ──────────────────────
│                                                                 │
│  ① Entender a arquitetura                 ⑤ Criar instância EC2 │
│  ② Subir ambiente local                   ⑥ User Data automação │
│  ③ Testar CRUD no Hoppscotch              ⑦ Security Group      │
│  ④ CI/CD no GitHub Actions                ⑧ Auditoria via SSH   │
│                                                                 │
│  "O software funciona?"                   "Como ele vai ao ar?" │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

# 🏗️ PILAR 1 — Lógica do Projeto: Build, Teste e CI/CD

## Etapa 1 — Entendendo a Arquitetura (5 min de leitura)

### O que é o Cookie Factory?

Um sistema SaaS de gestão de estoque construído como **Monolito Modular** com **multi-tenancy**. Cada empresa (tenant) tem dados isolados — a Padaria do João nunca vê os produtos da Confeitaria da Maria.

### Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | NestJS (TypeScript) |
| ORM | Prisma |
| Banco | PostgreSQL |
| Auth | JWT (com tenantId no payload) |
| Testes | Jest |
| Process Manager | PM2 |

### Estrutura de Módulos

```
backend/src/modules/
├── auth/        → Login, emissão de JWT
├── tenants/     → Cadastro de empresas (CRUD aberto)
├── users/       → Usuários por tenant (CRUD protegido)
├── products/    → Produtos por tenant (CRUD protegido)
├── suppliers/   → Fornecedores (esqueleto)
├── materials/   → Estoque (esqueleto)
├── reports/     → Relatórios (esqueleto)
└── health/      → Health check (/api/v1/health)
```

### Como funciona o isolamento?

```
1. Usuário faz login → recebe JWT com { tenantId: 1 }
2. Ao chamar GET /products, o Guard extrai tenantId do JWT
3. O Repository filtra: WHERE tenantId = 1
4. Resultado: só produtos do tenant 1 aparecem
```

### Arquivos-chave para o professor mostrar

| Arquivo | O que demonstra |
|---------|-----------------|
| `backend/prisma/schema.prisma` | Models com @@index([tenantId]) |
| `backend/src/common/guards/jwt-auth.guard.ts` | Guard que extrai JWT |
| `backend/src/common/decorators/current-user.decorator.ts` | Decorator @CurrentUser() |
| `backend/src/modules/products/products.repository.ts` | Queries filtradas por tenantId |
| `backend/src/modules/products/products.controller.ts` | @UseGuards(JwtAuthGuard) |
| `tests/security.test.js` | Teste de isolamento |

---

## Etapa 2 — Subindo o Ambiente Local (10 min)

### Pré-requisitos na máquina do professor

- Node.js v20+ (`node -v`)
- Docker Desktop rodando (`docker ps`)
- Git (`git --version`)

### Passo a passo

```bash
# 1. Clonar o repositório (se ainda não tiver)
git clone https://github.com/marcio-loiola/-mb-supply-hub.git
cd mb-supply-hub

# 2. Subir o PostgreSQL via Docker
docker compose up -d
# Aguarde o healthcheck: docker compose ps (status "healthy")

# 3. Instalar dependências do backend
cd backend
npm install

# 4. Criar o arquivo .env local
# Copie o template e ajuste se necessário:
```

Crie o arquivo `backend/.env`:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/supply_hub_db
JWT_SECRET=super_secret_cookie_factory_key
JWT_EXPIRES_IN=1d
NODE_ENV=development
PORT=3000
```

```bash
# 5. Gerar o Prisma Client
npx prisma generate

# 6. Aplicar migrações no banco
npx prisma migrate deploy

# 7. Popular com dados de demonstração
npx prisma db seed
# Saída esperada:
#   ✅ Tenant criado: Padaria do João (id: 1)
#   ✅ Tenant criado: Confeitaria da Maria (id: 2)
#   ✅ Usuário criado: João Admin
#   ✅ Usuário criado: Maria Admin
#   ✅ 3 produtos criados para Padaria do João
#   ✅ 2 produtos criados para Confeitaria da Maria
#   📋 Credenciais: admin@padaria.com / senha123
#                   admin@confeitaria.com / senha123

# 8. Iniciar o servidor de desenvolvimento
npm run start:dev
# Saída: "Nest application successfully started"
```

### Verificação rápida

Abra o browser: `http://localhost:3000/api/v1/health`

Resposta esperada:
```json
{
  "data": { "service": "backend", "status": "ok", "timestamp": "..." },
  "message": "Health check completed successfully"
}
```

✅ **Se chegou aqui, o Pilar 1 está rodando localmente.**

---

## Etapa 3 — Testando o CRUD no Hoppscotch (15 min)

Abra **[hoppscotch.io](https://hoppscotch.io)** no browser.

### Teste 1: Health Check (sem auth)

| Campo | Valor |
|-------|-------|
| Método | `GET` |
| URL | `http://localhost:3000/api/v1/health` |

→ Clique **Send**. Deve retornar `200 OK`.

---

### Teste 2: Listar Tenants (sem auth)

| Campo | Valor |
|-------|-------|
| Método | `GET` |
| URL | `http://localhost:3000/api/v1/tenants` |

→ Deve mostrar os 2 tenants do seed.

---

### Teste 3: Criar um Tenant (sem auth)

| Campo | Valor |
|-------|-------|
| Método | `POST` |
| URL | `http://localhost:3000/api/v1/tenants` |
| Content-Type | `application/json` |

**Body:**
```json
{
  "name": "Doceria Premium",
  "cnpj": "33.333.333/0001-33",
  "address": "Rua do Açúcar, 200 - Curitiba/PR"
}
```

→ Deve retornar `201 Created`.

---

### Teste 4: Login como Tenant 1 (Padaria)

| Campo | Valor |
|-------|-------|
| Método | `POST` |
| URL | `http://localhost:3000/api/v1/auth/login` |

**Body:**
```json
{
  "email": "admin@padaria.com",
  "password": "senha123"
}
```

→ Resposta contém `accessToken`. **Copie esse token!**

---

### Teste 5: Listar Produtos (com auth — Tenant 1)

| Campo | Valor |
|-------|-------|
| Método | `GET` |
| URL | `http://localhost:3000/api/v1/products` |
| Authorization | `Bearer <TOKEN_DO_TESTE_4>` |

→ Deve mostrar **apenas** PAD-001, PAD-002, PAD-003 (produtos da Padaria).

---

### Teste 6: Criar Produto (com auth — Tenant 1)

| Campo | Valor |
|-------|-------|
| Método | `POST` |
| URL | `http://localhost:3000/api/v1/products` |
| Authorization | `Bearer <TOKEN_PADARIA>` |

**Body:**
```json
{
  "name": "Sonho de Creme",
  "description": "Sonho recheado com creme",
  "sku": "PAD-004"
}
```

---

### 🔒 Teste 7: Prova de Isolamento Multi-Tenant

**7a.** Faça login como Tenant 2:

```json
POST /api/v1/auth/login
{ "email": "admin@confeitaria.com", "password": "senha123" }
```

**7b.** Liste produtos com o token do Tenant 2:

```
GET /api/v1/products
Authorization: Bearer <TOKEN_CONFEITARIA>
```

→ Deve mostrar **apenas** CONF-001, CONF-002. Nenhum produto PAD-* aparece!

**7c.** Tente acessar um produto do Tenant 1 usando token do Tenant 2:

```
GET /api/v1/products/1
Authorization: Bearer <TOKEN_CONFEITARIA>
```

→ Deve retornar **404 Not Found**. O produto existe, mas o tenant não tem acesso!

---

### Teste 8: Erros de Validação

**Sem token:**
```
GET /api/v1/products
(sem header Authorization)
```
→ `401 Unauthorized` — "Token não fornecido"

**Body inválido:**
```json
POST /api/v1/products
Authorization: Bearer <TOKEN>
{ "description": "Sem nome e sem SKU" }
```
→ `400 Bad Request` com lista de erros.

---

### ✅ Checklist de Testes Concluídos

- [ ] Health check retorna 200
- [ ] CRUD de Tenants funciona
- [ ] Login retorna JWT com tenantId
- [ ] Produtos são filtrados por tenant
- [ ] Tenant A não acessa dados do Tenant B (404)
- [ ] Requisição sem token retorna 401
- [ ] Body inválido retorna 400

---

## Etapa 4 — CI/CD no GitHub Actions (5 min)

O projeto já possui um pipeline em `.github/workflows/main.yml`.

### O que o pipeline faz

```
Push na main → Job "Test" → Job "Docker Build" → Job "Deploy"
                  │                                    │
            npm ci + npm test              Template para SSH/k8s
```

### Para o professor demonstrar

1. Abra o GitHub: `https://github.com/marcio-loiola/-mb-supply-hub`
2. Vá em **Actions** → mostra o histórico de execuções
3. Explique:

> *"Cada push na main dispara automaticamente os testes. Se passarem, a imagem Docker é construída. No cenário real, o job de deploy conectaria via SSH na EC2 e faria o pull da nova versão."*

### Conectando CI/CD com EC2 (conceitual)

```
Desenvolvedor → git push → GitHub Actions → Testes ✅ → Build Docker
                                                              ↓
                                                    SSH na EC2 → Pull + Restart
```

Para a prática de hoje, o deploy é manual via **User Data**. O CI/CD é mostrado como o próximo passo natural de evolução.

---

# ☁️ PILAR 2 — Migração para EC2 (IaaS)

## Etapa 5 — Preparação na AWS (5 min)

### Pré-requisitos

- [ ] Conta AWS com Free Tier
- [ ] Key Pair (.pem) criada na região escolhida (ex: us-east-1)

### O que muda de PaaS para IaaS?

| Aspecto | PaaS (Heroku) | IaaS (EC2) |
|---------|--------------|------------|
| Deploy | `git push heroku main` | Script User Data |
| Servidor | Gerenciado | Ubuntu Server (você gerencia) |
| Firewall | Automático | Security Group (manual) |
| Processo | Procfile | PM2 |
| Banco | Add-on | PostgreSQL na própria VM |
| Custo | Dyno/hora | Instância/hora |
| Controle | Limitado | **Total** |

O projeto já tem um `Procfile` (PaaS). Na EC2, usamos o script `scripts/ec2-user-data.sh`.

---

## Etapa 6 — Lançando a Instância EC2 (10 min)

### 6.1 Criar a instância

1. AWS Console → **EC2** → **Launch Instance**

| Campo | Valor |
|-------|-------|
| Name | `cookie-factory-nestjs` |
| AMI | Ubuntu Server 24.04 LTS (Free tier) |
| Instance type | `t2.micro` |
| Key pair | Selecione sua .pem |

### 6.2 Configurar o Security Group

Crie um novo Security Group ou selecione existente com estas regras **Inbound**:

| Tipo | Porta | Origem | Para quê |
|------|-------|--------|----------|
| SSH | 22 | **Meu IP** | Gerência remota |
| HTTP | 80 | 0.0.0.0/0 | Acesso público à API |

> ⚠️ **Nunca** libere porta 22 para 0.0.0.0/0 em produção!

### 6.3 Colar o User Data

1. Expanda **Advanced details**
2. No campo **User data**, cole o conteúdo de `scripts/ec2-user-data.sh`
3. Clique **Launch Instance**

### O que o script faz automaticamente

```
[1/8] apt update + upgrade
[2/8] Instala Node.js v20
[3/8] Instala Git, build-essential, PM2
[4/8] Instala PostgreSQL + cria banco cookie_factory_db
[5/8] git clone do repositório → /var/www/cookie-factory
[6/8] Gera .env com PORT=80, JWT_SECRET, DATABASE_URL
[7/8] npm install → prisma generate → migrate → seed → build
[8/8] pm2 start dist/main.js --name "cookie-factory-nestjs"
```

> 🎤 **Fala para a aula:**
> *"Todo aquele CRUD que testamos no Hoppscotch — Tenants, Produtos, Auth — está sendo compilado e o Prisma está criando as tabelas no banco agora mesmo, sem que eu tenha digitado uma linha de terminal dentro do Linux."*

### 6.4 Aguardar (~5 min)

A instância passa por dois status checks. Enquanto espera, explique o diagrama:

```
Browser                AWS Cloud
  │                    ┌──────────────────────┐
  │    HTTP :80        │  Security Group      │
  ├───────────────────►│  ┌────────────────┐  │
  │                    │  │  EC2 (Ubuntu)   │  │
  │                    │  │  ┌──────────┐   │  │
  │                    │  │  │ PM2      │   │  │
  │                    │  │  │ └NestJS  │   │  │
  │                    │  │  │  └Prisma │   │  │
  │                    │  │  │   └─►PG  │   │  │
  │                    │  │  └──────────┘   │  │
  │                    │  └────────────────┘  │
  │                    └──────────────────────┘
```

---

## Etapa 7 — Testando na EC2 via Hoppscotch (10 min)

### 7.1 Primeiro acesso

Copie o **IP Público** da instância no painel EC2.

No Hoppscotch, mude a base URL para: `http://<IP_PUBLICO>/api/v1`

**Teste:** `GET http://<IP_PUBLICO>/api/v1/health`

→ Mesma resposta que obteve localmente! A API está no ar.

### 7.2 Repetir os testes do Pilar 1

Refaça os testes 4-7 do Hoppscotch agora apontando para o IP da EC2:

1. Login: `POST http://<IP>/api/v1/auth/login`
2. Listar produtos: `GET http://<IP>/api/v1/products` (com Bearer token)
3. Criar produto: `POST http://<IP>/api/v1/products`
4. Teste de isolamento: login com Tenant 2 e verificar dados separados

> *"Vejam: o mesmo CRUD que testamos na máquina local agora está rodando em um servidor Linux na AWS, acessível pela internet."*

### 7.3 Desafio Security Group (demonstração ao vivo)

1. No painel EC2 → **Security Groups** → **Edit inbound rules**
2. **Remova** a regra da porta 80 → Salve
3. Peça para atualizarem o Hoppscotch → **timeout!**

```
ANTES:  Hoppscotch → [SG ✅ porta 80] → EC2 → NestJS → Resposta
DEPOIS: Hoppscotch → [SG ❌ porta 80] → TIMEOUT
```

> *"A API continua rodando na VM. O PM2 nem percebeu. O que mudou foi a muralha de rede."*

4. **Restaure** a regra → funciona de novo!

---

## Etapa 8 — Auditoria via SSH (10 min)

### 8.1 Conectar

```bash
chmod 400 sua-chave.pem
ssh -i "sua-chave.pem" ubuntu@<IP_PUBLICO>
```

### 8.2 Verificar o PM2

```bash
cd /var/www/cookie-factory
pm2 status
```

Saída esperada:
```
┌──┬──────────────────────────┬──────┬────┬────────┐
│id│ name                     │ mode │ ↺  │ status │
├──┼──────────────────────────┼──────┼────┼────────┤
│0 │ cookie-factory-nestjs    │ fork │ 0  │ online │
└──┴──────────────────────────┴──────┴────┴────────┘
```

```bash
# Ver logs em tempo real (peça para alguém fazer request no Hoppscotch)
pm2 logs
```

### 8.3 Auditoria do .env

```bash
cat /var/www/cookie-factory/backend/.env
```

> *"A DATABASE_URL e o JWT_SECRET estão isolados na VM, fora do código no GitHub."*

Prova:
```bash
grep "env" /var/www/cookie-factory/.gitignore
# Saída: .env está no .gitignore
```

### 8.4 Ver o log completo do setup

```bash
cat /var/log/cookie-factory-setup.log
```

Mostra cada etapa que o User Data executou durante a inicialização.

---

# 📋 Checklist Final do Professor

## Antes da aula

- [ ] Clonou o repositório e fez `npm install` no backend
- [ ] Subiu o PostgreSQL com `docker compose up -d`
- [ ] Criou o `.env` no backend com as variáveis corretas
- [ ] Executou `npx prisma migrate deploy` e `npx prisma db seed`
- [ ] Rodou `npm run start:dev` e testou `/api/v1/health`
- [ ] Fez todos os testes no Hoppscotch localmente (8 testes)
- [ ] Verificou que o isolamento multi-tenant funciona (Teste 7)
- [ ] Criou Key Pair na AWS
- [ ] Lançou instância EC2 com User Data script
- [ ] Testou `/api/v1/health` no IP público da EC2
- [ ] Repetiu os testes do Hoppscotch apontando para EC2
- [ ] Testou remoção/restauração da regra do Security Group
- [ ] Conectou via SSH e verificou `pm2 status`

## Durante a aula (30 min)

| Min | Ação | Pilar |
|-----|------|-------|
| 0-5 | Explicar arquitetura modular + multi-tenancy | 1 |
| 5-10 | Mostrar código-chave (guard, decorator, repository) | 1 |
| 10-15 | Lançar EC2 com User Data + explicar Security Group | 2 |
| 15-20 | Testar health + login + produtos no Hoppscotch (EC2) | 1+2 |
| 20-25 | Desafio Security Group (remover/restaurar porta 80) | 2 |
| 25-30 | SSH na VM: pm2 status, pm2 logs, cat .env | 2 |

---

# 🗺️ Tabela de Referência Rápida

## Endpoints da API

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/api/v1/health` | ❌ | Health check |
| `POST` | `/api/v1/tenants` | ❌ | Criar tenant |
| `GET` | `/api/v1/tenants` | ❌ | Listar tenants |
| `GET` | `/api/v1/tenants/:id` | ❌ | Buscar tenant |
| `PATCH` | `/api/v1/tenants/:id` | ❌ | Atualizar tenant |
| `DELETE` | `/api/v1/tenants/:id` | ❌ | Desativar tenant |
| `POST` | `/api/v1/auth/login` | ❌ | Login → JWT |
| `POST` | `/api/v1/users` | ✅ | Criar usuário |
| `GET` | `/api/v1/users` | ✅ | Listar usuários |
| `GET` | `/api/v1/users/:id` | ✅ | Buscar usuário |
| `PATCH` | `/api/v1/users/:id` | ✅ | Atualizar usuário |
| `POST` | `/api/v1/products` | ✅ | Criar produto |
| `GET` | `/api/v1/products` | ✅ | Listar produtos |
| `GET` | `/api/v1/products/:id` | ✅ | Buscar produto |
| `PATCH` | `/api/v1/products/:id` | ✅ | Atualizar produto |
| `DELETE` | `/api/v1/products/:id` | ✅ | Desativar produto |

## Credenciais de Teste (Seed)

| Tenant | Email | Senha | Produtos |
|--------|-------|-------|----------|
| Padaria do João | `admin@padaria.com` | `senha123` | PAD-001, PAD-002, PAD-003 |
| Confeitaria da Maria | `admin@confeitaria.com` | `senha123` | CONF-001, CONF-002 |

## Arquivos do Projeto

| Arquivo | Propósito |
|---------|-----------|
| `scripts/ec2-user-data.sh` | Script para User Data da EC2 |
| `docs/roteiro-completo.md` | Este documento |
| `docs/api-testing-guide.md` | Guia detalhado de testes API |
| `docs/pratica-ec2-iaas.md` | Guia detalhado da prática EC2 |
| `docs/codex-system-spec.md` | Especificação técnica completa |
| `.github/workflows/main.yml` | Pipeline CI/CD |

---

# 🔧 Troubleshooting

| Problema | Solução |
|----------|---------|
| `npm run start:dev` falha | Verificar `.env` (DATABASE_URL, JWT_SECRET, JWT_EXPIRES_IN) |
| Prisma migrate falha | PostgreSQL está rodando? `docker compose ps` |
| Seed falha | Migrate foi executado antes? `npx prisma migrate deploy` |
| EC2 API não responde | `pm2 logs` via SSH / verificar Security Group porta 80 |
| 401 no Hoppscotch | Token expirou? Refaça o login |
| 404 em produto | Isolamento funcionando! Está usando token do tenant correto? |
