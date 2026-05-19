# 🍪 Cookie Factory Multitenant SaaS

Bem-vindo ao repositório do **Cookie Factory**! Este projeto é um ambiente de aprendizado e desenvolvimento focado em arquitetura SaaS (Software as a Service) com modelo Multi-tenant, pronto para ser hospedado em plataformas PaaS (Heroku, Render, Google App Engine).

## 🛠️ Stack Tecnológica e Arquitetura

O sistema foi desenhado utilizando uma **Arquitetura de Monolito Modular**, com as fronteiras de cada módulo bem definidas, facilitando uma futura extração para microsserviços.

*   **Backend:** Node.js com NestJS e TypeScript.
*   **Frontend:** React com TypeScript.
*   **Banco de Dados:** PostgreSQL.
*   **ORM:** Prisma.
*   **Deploy & Infraestrutura:** Docker Compose, CI/CD com GitHub Actions, e Deploy em PaaS.

## 📦 Funcionalidades do Backend (Módulos Core)

O projeto é dividido em domínios de negócio independentes, garantindo que o acoplamento seja minimizado. Todos os dados são isolados por inquilino (`tenantId`).

1. **Gestão de Tenants (Inquilinos):** Cadastro e gerenciamento de diferentes empresas na mesma base de dados.
2. **Usuários e Autenticação:** Controle de acesso com JWT e gestão do ciclo de vida dos usuários.
3. **Permissões (RBAC):** Definição de papéis e regras de autorização granulares.
4. **Catálogo de Produtos:** Gerenciamento do portfólio de produtos de cada inquilino.
5. **Fornecedores:** Cadastro de parceiros comerciais.
6. **Materiais e Estoque:** Registro de matérias-primas e movimentos de entrada/saída no inventário.
7. **Relatórios (Reports):** Consolidação de dados analíticos respeitando estritamente o isolamento de informações.

## 🎯 Objetivo da Aula

O objetivo deste repositório é demonstrar, na prática, conceitos vitais de engenharia de software escalável:
1. **Pipeline de CI/CD:** Como automatizar a garantia de qualidade com GitHub Actions.
2. **Segurança Multi-tenant:** Como garantir que a "Loja A" nunca acesse os dados da "Loja B" em um mesmo banco de dados, utilizando JWT e validações no código.
3. **PaaS (Platform as a Service):** Como as variáveis de ambiente (Secrets) protegem informações sensíveis (como credenciais de banco e chaves de API).

## 🚀 Como Explorar este Repositório (Guia da Aula)

Ao navegar pelo código, preste atenção nestes componentes cruciais:

*   **O "Fiscal" (Pipeline):** Vá até `.github/workflows/main.yml`. É aqui que configuramos nosso robô fiscal. Ele roda os testes toda vez que há um novo código, bloqueando o envio de erros para a produção.
*   **O Teste de Segurança:** Abra o arquivo `tests/security.test.js`. Este teste simula o isolamento de dados. Se alguém alterar a regra de negócios por acidente, o teste vai falhar.
*   **A "Lei do Tenant" (Middleware):** Em `src/middlewares/authMiddleware.js`, temos o porteiro da nossa fábrica. Ele intercepta o Token JWT e extrai o `tenant_id`, carimbando a identidade da loja em todas as requisições subsequentes.
*   **Segurança de Credenciais:** O arquivo `.env.example` mostra quais variáveis o projeto espera receber do ambiente PaaS. **Nunca adicione o arquivo `.env` verdadeiro no repositório!**

## 💻 Como Rodar os Testes Localmente

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Execute a suíte de testes:**
   ```bash
   npm test
   ```
   *Se os testes passarem, significa que a segurança de isolamento está intacta!*

---
*Este repositório é parte da Operação Cookie Factory (SaaS & PaaS) para ensino de Engenharia de Software.*
