# Deploy via Git - Sistema CRM Gráfica

Guia completo para fazer deploy usando Git, igual ao seu projeto precompeonato.

---

## Configuração Inicial

### 1. Preparar Projeto no Windows

Abrir PowerShell ou Git Bash na pasta do projeto:

```bash
cd C:\Users\tiago\OneDrive\Projetos\grafica-crm
```

### 2. Inicializar Git (se ainda não tiver)

```bash
git init
```

### 3. Adicionar arquivos ao Git

```bash
git add .
git status
```

Verificar se `.env` NÃO está sendo adicionado (deve estar no .gitignore).

### 4. Fazer primeiro commit

```bash
git commit -m "Initial commit - Sistema de Gestão Comercial para Gráfica"
```

---

## Criar Repositório Remoto

### Opção A: GitHub (Recomendado)

1. Acessar: https://github.com
2. Clicar em **New repository**
3. Nome: `grafica-crm`
4. Descrição: `Sistema de Gestão Comercial para Gráfica`
5. Escolher: **Private** (recomendado para projeto comercial)
6. NÃO marcar "Initialize with README"
7. Clicar em **Create repository**

### Opção B: GitLab

1. Acessar: https://gitlab.com
2. Clicar em **New project**
3. Nome: `grafica-crm`
4. Visibility: **Private**
5. Clicar em **Create project**

### Opção C: Bitbucket

1. Acessar: https://bitbucket.org
2. Clicar em **Create repository**
3. Nome: `grafica-crm`
4. Access level: **Private**
5. Clicar em **Create repository**

---

## Conectar Repositório Local ao Remoto

### Para GitHub:
```bash
git remote add origin https://github.com/seu-usuario/grafica-crm.git
git branch -M main
git push -u origin main
```

### Para GitLab:
```bash
git remote add origin https://gitlab.com/seu-usuario/grafica-crm.git
git branch -M main
git push -u origin main
```

### Para Bitbucket:
```bash
git remote add origin https://bitbucket.org/seu-usuario/grafica-crm.git
git branch -M main
git push -u origin main
```

Se pedir autenticação, usar:
- **Username:** seu usuário
- **Password:** Personal Access Token (não a senha da conta)

---

## Deploy no VPS

### 1. Conectar ao VPS

```bash
ssh root@srv1444870
```

### 2. Clonar repositório

```bash
cd /var/www
git clone https://github.com/seu-usuario/grafica-crm.git
cd grafica-crm
```

Se o repositório for privado, vai pedir credenciais:
- **Username:** seu usuário
- **Password:** Personal Access Token

### 3. Instalar dependências

```bash
npm install --production
```

### 4. Criar arquivo .env

```bash
cp .env.example .env
nano .env
```

Configurar variáveis:
```env
DB_HOST=localhost
DB_USER=grafica_user
DB_PASSWORD=SenhaForte123!
DB_NAME=grafica_crm
DB_PORT=3306

JWT_SECRET=sua_chave_secreta_muito_forte_minimo_32_caracteres
JWT_EXPIRES_IN=8h

PORT=3001
NODE_ENV=production
```

Salvar: `Ctrl+O`, Enter, `Ctrl+X`

### 5. Configurar banco de dados

```bash
mysql -u root -p
```

```sql
CREATE DATABASE grafica_crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'grafica_user'@'localhost' IDENTIFIED BY 'SenhaForte123!';
GRANT ALL PRIVILEGES ON grafica_crm.* TO 'grafica_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 6. Importar schema

```bash
mysql -u grafica_user -p grafica_crm < database/schema.sql
```

### 7. Gerar senha admin

```bash
node scripts/generate-hash.js admin123
```

Atualizar no banco:
```bash
mysql -u grafica_user -p grafica_crm
```

```sql
UPDATE usuarios SET senha = 'HASH_GERADO' WHERE email = 'admin@grafica.com';
EXIT;
```

### 8. Iniciar com PM2

```bash
pm2 start server.js --name grafica-crm
pm2 save
pm2 status
```

### 9. Configurar Nginx e SSL

Seguir passos 10-13 do GUIA-INSTALACAO-VPS.md

---

## Workflow de Desenvolvimento

### No seu computador (Windows):

#### 1. Fazer alterações no código
```bash
cd C:\Users\tiago\OneDrive\Projetos\grafica-crm
# Editar arquivos...
```

#### 2. Ver o que mudou
```bash
git status
git diff
```

#### 3. Adicionar alterações
```bash
# Adicionar arquivo específico
git add routes/clientes.js

# OU adicionar todos os arquivos modificados
git add .
```

#### 4. Fazer commit
```bash
git commit -m "Adiciona validação de CPF/CNPJ no cadastro de clientes"
```

#### 5. Enviar para repositório
```bash
git push
```

### No VPS (atualizar produção):

```bash
ssh root@srv1444870
cd /var/www/grafica-crm

# Baixar atualizações
git pull

# Se houver novas dependências
npm install --production

# Reiniciar aplicação
pm2 restart grafica-crm

# Ver logs
pm2 logs grafica-crm --lines 20
```

---

## Comandos Git Úteis

### Ver histórico de commits
```bash
git log --oneline
```

### Ver diferenças antes de commitar
```bash
git diff
```

### Desfazer alterações não commitadas
```bash
git checkout -- arquivo.js
```

### Ver branches
```bash
git branch
```

### Criar nova branch para desenvolvimento
```bash
git checkout -b desenvolvimento
```

### Voltar para branch main
```bash
git checkout main
```

### Mesclar branch de desenvolvimento
```bash
git checkout main
git merge desenvolvimento
```

---

## Configurar Personal Access Token

### GitHub:

1. Acessar: https://github.com/settings/tokens
2. Clicar em **Generate new token** → **Classic**
3. Nome: `VPS Hostinger`
4. Selecionar: `repo` (acesso completo aos repositórios)
5. Clicar em **Generate token**
6. **COPIAR O TOKEN** (não vai aparecer novamente!)
7. Usar este token como senha ao fazer git clone/pull/push

### GitLab:

1. Acessar: https://gitlab.com/-/profile/personal_access_tokens
2. Nome: `VPS Hostinger`
3. Selecionar: `read_repository`, `write_repository`
4. Clicar em **Create personal access token**
5. Copiar o token

### Bitbucket:

1. Acessar: https://bitbucket.org/account/settings/app-passwords/
2. Clicar em **Create app password**
3. Nome: `VPS Hostinger`
4. Permissões: `Repositories: Read, Write`
5. Clicar em **Create**
6. Copiar a senha

---

## Configurar SSH para Git (Opcional - mais seguro)

### No VPS:

```bash
# Gerar chave SSH
ssh-keygen -t ed25519 -C "seu-email@exemplo.com"
# Pressionar Enter 3 vezes (sem senha)

# Ver chave pública
cat ~/.ssh/id_ed25519.pub
```

Copiar a chave pública.

### No GitHub/GitLab/Bitbucket:

**GitHub:**
1. Acessar: https://github.com/settings/keys
2. Clicar em **New SSH key**
3. Título: `VPS Hostinger`
4. Colar a chave pública
5. Clicar em **Add SSH key**

**GitLab:**
1. Acessar: https://gitlab.com/-/profile/keys
2. Colar a chave pública
3. Título: `VPS Hostinger`
4. Clicar em **Add key**

**Bitbucket:**
1. Acessar: https://bitbucket.org/account/settings/ssh-keys/
2. Clicar em **Add key**
3. Colar a chave pública
4. Clicar em **Add key**

### Clonar usando SSH:

```bash
# GitHub
git clone git@github.com:seu-usuario/grafica-crm.git

# GitLab
git clone git@gitlab.com:seu-usuario/grafica-crm.git

# Bitbucket
git clone git@bitbucket.org:seu-usuario/grafica-crm.git
```

---

## Script de Deploy Automático

Criar script para facilitar deploy:

```bash
nano /var/www/grafica-crm/deploy.sh
```

Adicionar:
```bash
#!/bin/bash

echo "🚀 Iniciando deploy do CRM Gráfica..."

cd /var/www/grafica-crm

echo "📥 Baixando atualizações..."
git pull

echo "📦 Instalando dependências..."
npm install --production

echo "🔄 Reiniciando aplicação..."
pm2 restart grafica-crm

echo "📊 Status da aplicação:"
pm2 status grafica-crm

echo "✅ Deploy concluído!"
echo "📝 Ver logs: pm2 logs grafica-crm"
```

Dar permissão de execução:
```bash
chmod +x /var/www/grafica-crm/deploy.sh
```

Usar:
```bash
cd /var/www/grafica-crm
./deploy.sh
```

---

## Ignorar Arquivos Sensíveis

Verificar se `.gitignore` está correto:

```bash
cat .gitignore
```

Deve conter:
```
node_modules/
.env
*.log
.DS_Store
uploads/
```

**NUNCA commitar:**
- `.env` (senhas e credenciais)
- `node_modules/` (dependências)
- Arquivos de log
- Uploads de usuários

---

## Troubleshooting

### ❌ Erro: "Permission denied (publickey)"
**Solução:** Configurar SSH key ou usar HTTPS com token

### ❌ Erro: "Authentication failed"
**Solução:** Usar Personal Access Token em vez da senha da conta

### ❌ Conflito ao fazer git pull
```bash
# Ver arquivos em conflito
git status

# Opção 1: Descartar alterações locais
git reset --hard origin/main

# Opção 2: Fazer stash das alterações
git stash
git pull
git stash pop
```

### ❌ Esqueci de adicionar arquivo no .gitignore
```bash
# Remover do Git mas manter no disco
git rm --cached .env
git commit -m "Remove .env do repositório"
git push
```

---

## Boas Práticas

1. **Sempre testar localmente antes de fazer push**
2. **Fazer commits pequenos e frequentes**
3. **Usar mensagens de commit descritivas**
4. **Nunca commitar senhas ou credenciais**
5. **Fazer backup do banco antes de atualizar**
6. **Testar em ambiente de desenvolvimento primeiro**
7. **Usar branches para features grandes**
8. **Revisar código antes de fazer merge**

---

## Exemplo de Workflow Completo

```bash
# No Windows
cd C:\Users\tiago\OneDrive\Projetos\grafica-crm
git pull  # Garantir que está atualizado
# Fazer alterações...
git add .
git commit -m "Adiciona relatório de vendas por período"
git push

# No VPS
ssh root@srv1444870
cd /var/www/grafica-crm
./deploy.sh  # OU manualmente:
# git pull
# npm install --production
# pm2 restart grafica-crm
# pm2 logs grafica-crm
```

---

**Pronto! Agora você tem deploy via Git igual ao seu projeto precompeonato! 🚀**
