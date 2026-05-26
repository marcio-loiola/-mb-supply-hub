# CI/CD: Guia rápido

Este repositório inclui um workflow genérico em `.github/workflows/main.yml` que realiza:

- Instalação e execução de testes (`npm ci`, `npm test`).
- Build e push de imagem Docker usando `docker/build-push-action` (Buildx).
- Job `deploy` como template para você adaptar (SSH, k8s, cloud provider, etc.).

Secrets necessários (defina em Settings → Secrets):

- `DOCKER_REGISTRY` (opcional, ex: `docker.io`).
- `DOCKER_USERNAME`
- `DOCKER_PASSWORD`
- `IMAGE_NAME` (ex: `meu-usuario/meu-repo`)

Secrets opcionais para deploy via SSH (exemplo de template):

- `SSH_HOST`
- `SSH_USER`
- `SSH_PRIVATE_KEY`
- `SSH_PORT` (opcional, default 22)

Como disparar:

- Push para `main` executa `test`, `docker-build-push` e `deploy` por padrão.
- Você pode também usar `workflow_dispatch` e marcar o input `deploy=true` para rodar manualmente (útil para deploys manuais).

Adaptação do deploy:

- Substitua o passo `Deploy placeholder` por ações específicas ao seu ambiente:
  - Kubernetes: use `azure/setup-kubectl` + `kubectl set image` ou `kubectl rollout`.
  - Remoto com Docker Compose: usar `appleboy/ssh-action` para rodar `docker pull` + `docker-compose -f docker-compose.prod.yml up -d`.
  - Cloud providers (AWS/GCP/Azure): use as Actions oficiais ou integrações provider-specific.

Notas:

- O workflow atual exige que `DOCKER_USERNAME`, `DOCKER_PASSWORD` e `IMAGE_NAME` estejam definidos para executar o job de build/push.
- Ajuste `node-version` e comandos (`npm ci`, `npm test`) conforme necessário.

Se quiser, eu adapto o `deploy` para um destino específico (k8s, Azure, AWS ECS, DigitalOcean Apps, Heroku, etc.).
