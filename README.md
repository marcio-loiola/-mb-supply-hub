# 🍪 Cookie Factory Multitenant SaaS

Bem-vindo ao repositório do **Cookie Factory**! Este projeto é um ambiente de aprendizado e desenvolvimento focado em arquitetura SaaS (Software as a Service) com modelo Multi-tenant.

## 🛠️ Stack Tecnológica e Arquitetura

O sistema foi desenhado utilizando uma **Arquitetura de Monolito Modular**, com as fronteiras de cada módulo bem definidas, facilitando uma futura extração para microsserviços.

*   **Backend:** Node.js com NestJS e TypeScript.
*   **Frontend:** React com TypeScript.
*   **Banco de Dados:** PostgreSQL.
*   **ORM:** Prisma.
*   **Deploy & Infraestrutura:** Docker Compose, CI/CD com GitHub Actions, e Instâncias AWS EC2.

## 📦 Funcionalidades do Backend (Módulos Core)

O projeto é dividido em domínios de negócio independentes, garantindo que o acoplamento seja minimizado. Todos os dados são isolados por inquilino (`tenantId`).

1. **Gestão de Tenants (Inquilinos):** Cadastro e gerenciamento de diferentes empresas na mesma base de dados.
2. **Usuários e Autenticação:** Controle de acesso com JWT e gestão do ciclo de vida dos usuários.
3. **Permissões (RBAC):** Definição de papéis e regras de autorização granulares.
4. **Catálogo de Produtos:** Gerenciamento do portfólio de produtos de cada inquilino.
5. **Fornecedores:** Cadastro de parceiros comerciais.
6. **Materiais e Estoque:** Registro de matérias-primas e movimentos de entrada/saída no inventário.
7. **Relatórios (Reports):** Consolidação de dados analíticos respeitando estritamente o isolamento de informações.

## 🎯 Guias para Aula e Estudo

Consulte a pasta `docs/` para roteiros completos:
* `docs/roteiro-completo.md`: Roteiro principal cobrindo desde código e validação até infraestrutura (AWS EC2).
* `docs/pratica-ec2-iaas.md`: Guia focado na infraestrutura EC2 (User Data, PM2, Deploy).
* `docs/api-testing-guide.md`: Como rodar as rotas da API e fazer testes de isolamento de tenants.

## 💻 Como Rodar os Testes Localmente

1. **Instale as dependências:**
   ```bash
   cd backend && npm install
   ```

2. **Execute a suíte de testes:**
   ```bash
   npm run test
   ```

---
*Este repositório é parte da Operação Cookie Factory para ensino de Engenharia de Software.*
