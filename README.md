# 🍪 Cookie Factory Multitenant SaaS

Bem-vindo ao repositório do **Cookie Factory**! Este projeto é um ambiente de aprendizado e desenvolvimento focado em arquitetura SaaS (Software as a Service) com modelo Multi-tenant, pronto para ser hospedado em plataformas PaaS (Heroku, Render, Google App Engine).

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
