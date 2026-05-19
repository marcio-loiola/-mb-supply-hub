#!/bin/bash
# =============================================================================
#  🍪 Cookie Factory NestJS — EC2 User Data (Ubuntu Server)
# =============================================================================
#  Script de provisionamento automático para AWS EC2.
#  Cole este conteúdo no campo "User Data" (Advanced Details) ao lançar
#  uma instância Ubuntu Server (t2.micro / free tier).
#
#  Repositório: https://github.com/marcio-loiola/-mb-supply-hub.git
#  Stack: NestJS · Prisma · PostgreSQL · PM2
# =============================================================================

set -euo pipefail

# Redireciona toda a saída para um log acessível dentro da VM
exec > >(tee /var/log/cookie-factory-setup.log) 2>&1
echo "=========================================="
echo " 🍪 Cookie Factory — Início do Setup"
echo " $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
echo "=========================================="

# --------------------------------------------------
# 1. ATUALIZAÇÃO DO SISTEMA OPERACIONAL
# --------------------------------------------------
echo "[1/8] Atualizando pacotes do sistema..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get upgrade -y

# --------------------------------------------------
# 2. INSTALAÇÃO DO NODE.JS v20 LTS
# --------------------------------------------------
echo "[2/8] Instalando Node.js v20 LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
echo "   Node.js $(node -v) instalado"
echo "   NPM $(npm -v) instalado"

# --------------------------------------------------
# 3. INSTALAÇÃO DE FERRAMENTAS (Git, PM2, build-essential)
# --------------------------------------------------
echo "[3/8] Instalando Git, build-essential e PM2..."
apt-get install -y git build-essential
npm install -g pm2
echo "   PM2 $(pm2 -v) instalado"

# --------------------------------------------------
# 4. INSTALAÇÃO DO POSTGRESQL 16
# --------------------------------------------------
echo "[4/8] Instalando PostgreSQL 16..."
apt-get install -y postgresql postgresql-contrib

# Garantir que o serviço está rodando
systemctl enable postgresql
systemctl start postgresql

# Criar banco e usuário para a Cookie Factory
sudo -u postgres psql <<SQL
  CREATE USER cookie_user WITH PASSWORD 'cookie_secret_2026';
  CREATE DATABASE cookie_factory_db OWNER cookie_user;
  GRANT ALL PRIVILEGES ON DATABASE cookie_factory_db TO cookie_user;
SQL
echo "   PostgreSQL configurado — banco: cookie_factory_db"

# --------------------------------------------------
# 5. CLONAGEM DO REPOSITÓRIO
# --------------------------------------------------
echo "[5/8] Clonando repositório para /var/www/cookie-factory..."
APP_DIR="/var/www/cookie-factory"
rm -rf "$APP_DIR"
git clone https://github.com/marcio-loiola/-mb-supply-hub.git "$APP_DIR"
cd "$APP_DIR/backend"
echo "   Repositório clonado em $APP_DIR"

# --------------------------------------------------
# 6. GERAÇÃO DO ARQUIVO .env DE PRODUÇÃO
# --------------------------------------------------
echo "[6/8] Gerando arquivo .env de produção..."
cat > "$APP_DIR/backend/.env" <<ENV
# ===================================================
# Cookie Factory — Variáveis de Ambiente (Produção)
# Gerado automaticamente pelo User Data em $(date -u '+%Y-%m-%d %H:%M:%S UTC')
# ===================================================

# Porta HTTP padrão — acesso público via browser
PORT=80

# Segredo JWT para assinatura de tokens multi-tenant
JWT_SECRET=super_secret_cookie_factory_key

# Expiração do token JWT
JWT_EXPIRES_IN=1d

# Ambiente de execução
NODE_ENV=production

# String de conexão Prisma → PostgreSQL local
DATABASE_URL=postgresql://cookie_user:cookie_secret_2026@localhost:5432/cookie_factory_db

# Log level
LOG_LEVEL=info

# Header de tenant (usado pelo middleware/guard)
TENANT_HEADER=x-tenant-id
ENV

echo "   .env gerado em $APP_DIR/backend/.env"

# --------------------------------------------------
# 7. ORQUESTRAÇÃO: DEPENDÊNCIAS, PRISMA E BUILD
# --------------------------------------------------
echo "[7/8] Instalando dependências e compilando..."

# 7a. Instalar dependências do backend
echo "   → npm install..."
npm install

# 7b. Gerar Prisma Client (mapeia tipos e client dentro do NestJS)
echo "   → npx prisma generate..."
npx prisma generate

# 7c. Aplicar migrações no banco PostgreSQL
echo "   → npx prisma migrate deploy..."
npx prisma migrate deploy

# 7d. Popular banco com dados de demonstração
echo "   → npx prisma db seed..."
npx prisma db seed

# 7e. Compilar TypeScript do NestJS
echo "   → npm run build..."
npm run build

echo "   Build completo — dist/ gerado"

# --------------------------------------------------
# 8. INICIALIZAÇÃO RESILIENTE COM PM2
# --------------------------------------------------
echo "[8/8] Iniciando Cookie Factory via PM2..."
pm2 start dist/main.js --name "cookie-factory-nestjs"
pm2 save
pm2 startup systemd -u root --hp /root

echo ""
echo "=========================================="
echo " ✅ Cookie Factory — Setup Completo!"
echo " $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
echo "=========================================="
echo ""
echo " 🌐 Acesse: http://<IP_PUBLICO_DA_VM>"
echo " 🔍 Health Check: http://<IP_PUBLICO_DA_VM>/api/v1/health"
echo " 📋 PM2 Status:  pm2 status"
echo " 📜 PM2 Logs:    pm2 logs"
echo " 📁 Projeto:     /var/www/cookie-factory"
echo " 🔐 .env:        /var/www/cookie-factory/backend/.env"
echo "=========================================="
