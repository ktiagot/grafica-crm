# Guia de Instalação no VPS Hostinger
## Instalação ao lado do projeto precompeonato

Você já tem: `/var/www/precompeonato`
Vamos criar: `/var/www/grafica-crm`

---

## PASSO 1: Upload dos Arquivos

### Opção A: Via Git (RECOMENDADO - igual seu projeto existente)

**No seu computador Windows:**

1. Inicializar Git no projeto (se ainda não tiver):
```bash
cd C:\Users\tiago\OneDrive\Projetos\grafica-crm
git init
git add .
git commit -m "Initial commit - Sistema CRM Gráfica"
```

2. Criar repositório no GitHub/GitLab/Bitbucket e fazer push:
```bash
git remote add origin https://github.com/seu-usuario/grafica-crm.git
git branch -M main
git push -u origin main
```

**No VPS via SSH:**

```bash
ssh root@srv1444870
cd /var/www
git clone https://github.com/seu-usuario/grafica-crm.git
cd grafica-crm
```

### Opção B: Via SFTP (FileZilla/WinSCP)

1. Abrir FileZilla ou WinSCP
2. Conectar ao VPS:
   - Host: `srv1444870` (ou IP do VPS)
   - Porta: `22`
   - Usuário: `root`
   - Senha: sua senha

3. Navegar até `/var/www/`
4. Criar nova pasta: `grafica-crm`
5. Fazer upload de TODOS os arquivos deste projeto para `/var/www/grafica-crm/`

**Estrutura final:**
```
/var/www/
├── precompeonato/          (seu projeto existente - via git)
└── grafica-crm/            (novo projeto CRM - via git)
    ├── config/
    ├── database/
    ├── middleware/
    ├── routes/
    ├── public/
    ├── scripts/
    ├── server.js
    ├── package.json
    └── .env.example
```

---

## PASSO 2: Conectar via SSH e Configurar

```bash
ssh root@srv1444870
cd /var/www/grafica-crm
```

---

## PASSO 3: Instalar Dependências

```bash
npm install --production
```

Se der erro de permissão:
```bash
chown -R root:root /var/www/grafica-crm
npm install --production
```

---

## PASSO 4: Criar Banco de Dados

```bash
mysql -u root -p
```

Executar no MySQL:
```sql
CREATE DATABASE grafica_crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Usar mesmo usuário do outro projeto OU criar novo
-- Opção 1: Dar permissão ao usuário existente
GRANT ALL PRIVILEGES ON grafica_crm.* TO 'seu_usuario_atual'@'localhost';

-- Opção 2: Criar novo usuário
CREATE USER 'grafica_user'@'localhost' IDENTIFIED BY 'SenhaForte123!';
GRANT ALL PRIVILEGES ON grafica_crm.* TO 'grafica_user'@'localhost';

FLUSH PRIVILEGES;
EXIT;
```

---

## PASSO 5: Importar Schema do Banco

```bash
cd /var/www/grafica-crm
mysql -u grafica_user -p grafica_crm < database/schema.sql
```

Digite a senha quando solicitado.

Opcional - Importar dados de exemplo:
```bash
mysql -u grafica_user -p grafica_crm < database/seed.sql
```

---

## PASSO 6: Configurar Variáveis de Ambiente

```bash
cd /var/www/grafica-crm
cp .env.example .env
nano .env
```

Configurar (IMPORTANTE - usar porta diferente):
```env
DB_HOST=localhost
DB_USER=grafica_user
DB_PASSWORD=SenhaForte123!
DB_NAME=grafica_crm
DB_PORT=3306

JWT_SECRET=sua_chave_secreta_muito_forte_minimo_32_caracteres_aleatoria
JWT_EXPIRES_IN=8h

PORT=3001
NODE_ENV=production
```

**ATENÇÃO:** 
- Use `PORT=3001` (seu outro projeto provavelmente usa 3000)
- Gere uma chave JWT forte e aleatória

Salvar: `Ctrl+O`, Enter, `Ctrl+X`

---

## PASSO 7: Gerar Hash da Senha Admin

```bash
cd /var/www/grafica-crm
node scripts/generate-hash.js admin123
```

Copiar o hash gerado e executar:
```bash
mysql -u grafica_user -p grafica_crm
```

```sql
UPDATE usuarios SET senha = 'COLE_O_HASH_AQUI' WHERE email = 'admin@grafica.com';
EXIT;
```

---

## PASSO 8: Testar Aplicação Localmente

```bash
cd /var/www/grafica-crm
node server.js
```

Deve aparecer:
```
Servidor rodando na porta 3001
Ambiente: production
```

Se funcionar, pressionar `Ctrl+C` para parar.

---

## PASSO 9: Configurar PM2

Verificar processos existentes:
```bash
pm2 list
```

Iniciar o CRM:
```bash
cd /var/www/grafica-crm
pm2 start server.js --name grafica-crm
pm2 save
```

Verificar status:
```bash
pm2 status
```

Deve mostrar:
- `precompeonato` (ou nome do seu projeto) - online
- `grafica-crm` - online

Ver logs:
```bash
pm2 logs grafica-crm --lines 20
```

---

## PASSO 10: Configurar Nginx

### Opção A: Subdomínio (Recomendado)
Exemplo: `crm.seudominio.com`

```bash
nano /etc/nginx/sites-available/grafica-crm
```

Colar esta configuração:
```nginx
server {
    listen 80;
    server_name crm.seudominio.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Opção B: Domínio Separado
Exemplo: `graficacrm.com`

```nginx
server {
    listen 80;
    server_name graficacrm.com www.graficacrm.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Salvar: `Ctrl+O`, Enter, `Ctrl+X`

Ativar o site:
```bash
ln -s /etc/nginx/sites-available/grafica-crm /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

---

## PASSO 11: Configurar DNS na Hostinger

### Para Subdomínio (crm.seudominio.com):

1. Acessar painel Hostinger: https://hpanel.hostinger.com
2. Ir em **Domínios** → Selecionar seu domínio
3. Clicar em **DNS / Nameservers**
4. Clicar em **Adicionar registro**
5. Configurar:
   - **Tipo:** A
   - **Nome:** crm
   - **Aponta para:** IP do seu VPS (mesmo IP do precompeonato)
   - **TTL:** 14400

6. Clicar em **Adicionar registro**

### Para Domínio Novo (graficacrm.com):

1. Adicionar domínio no painel Hostinger
2. Configurar DNS:
   - **Tipo:** A
   - **Nome:** @
   - **Aponta para:** IP do VPS
   - **TTL:** 14400

3. Adicionar www:
   - **Tipo:** A
   - **Nome:** www
   - **Aponta para:** IP do VPS
   - **TTL:** 14400

**Aguardar propagação DNS (1-24 horas, geralmente 1-2h)**

---

## PASSO 12: Testar Acesso HTTP

Após DNS propagar, testar:
```bash
curl http://crm.seudominio.com
```

Ou abrir no navegador: `http://crm.seudominio.com`

Deve carregar a página de login.

---

## PASSO 13: Configurar SSL (HTTPS)

Após DNS propagado e site acessível via HTTP:

```bash
certbot --nginx -d crm.seudominio.com
```

OU para domínio separado:
```bash
certbot --nginx -d graficacrm.com -d www.graficacrm.com
```

Seguir instruções:
1. Digitar email
2. Aceitar termos
3. Escolher opção 2 (redirecionar HTTP para HTTPS)

---

## PASSO 14: Testar Aplicação Final

Acessar: `https://crm.seudominio.com`

**Login padrão:**
- Email: `admin@grafica.com`
- Senha: `admin123`

**IMPORTANTE: Alterar senha após primeiro login!**

---

## Comandos Úteis

### Ver todos os projetos rodando:
```bash
pm2 list
```

### Ver logs do CRM:
```bash
pm2 logs grafica-crm
```

### Reiniciar CRM:
```bash
pm2 restart grafica-crm
```

### Reiniciar todos os projetos:
```bash
pm2 restart all
```

### Ver portas em uso:
```bash
netstat -tulpn | grep LISTEN
```

### Verificar Nginx:
```bash
nginx -t
systemctl status nginx
```

### Ver logs do Nginx:
```bash
tail -f /var/log/nginx/error.log
```

---

## Estrutura Final no VPS

```
/var/www/
├── precompeonato/
│   ├── server.js (porta 3000)
│   └── ...
│
└── grafica-crm/
    ├── server.js (porta 3001)
    ├── config/
    ├── routes/
    ├── public/
    └── ...

PM2 Processos:
├── precompeonato (porta 3000)
└── grafica-crm   (porta 3001)

Nginx:
├── seudominio.com → localhost:3000
└── crm.seudominio.com → localhost:3001
```

---

## Troubleshooting

### ❌ Erro: "Cannot find module"
```bash
cd /var/www/grafica-crm
npm install
pm2 restart grafica-crm
```

### ❌ Erro: "Port 3001 already in use"
```bash
# Ver o que está usando a porta
lsof -i :3001
# Mudar porta no .env
nano .env  # Alterar para PORT=3002
pm2 restart grafica-crm
```

### ❌ Erro: "ECONNREFUSED" (banco de dados)
```bash
# Verificar se MySQL está rodando
systemctl status mysql
# Testar conexão
mysql -u grafica_user -p grafica_crm
# Verificar credenciais no .env
nano .env
```

### ❌ 502 Bad Gateway
```bash
# Verificar se app está rodando
pm2 status
pm2 logs grafica-crm
# Reiniciar
pm2 restart grafica-crm
systemctl reload nginx
```

### ❌ DNS não resolve
```bash
# Testar DNS
nslookup crm.seudominio.com
# Aguardar propagação (até 24h)
```

---

## Backup

### Backup do banco:
```bash
mysqldump -u grafica_user -p grafica_crm > ~/backup-crm-$(date +%Y%m%d).sql
```

### Backup dos arquivos:
```bash
cd /var/www
tar -czf ~/backup-grafica-crm-$(date +%Y%m%d).tar.gz grafica-crm/
```

---

## Atualização do Sistema (via Git)

Quando fizer alterações no código:

**No seu computador:**
```bash
cd C:\Users\tiago\OneDrive\Projetos\grafica-crm
git add .
git commit -m "Descrição das alterações"
git push
```

**No VPS:**
```bash
ssh root@srv1444870
cd /var/www/grafica-crm
git pull
npm install  # Se houver novas dependências
pm2 restart grafica-crm
```

---

## Resumo Rápido

```bash
# 1. Clonar via Git
ssh root@srv1444870
cd /var/www
git clone https://github.com/seu-usuario/grafica-crm.git
cd grafica-crm

# 3. Instalar
npm install --production

# 4. Criar banco
mysql -u root -p
# Executar SQLs de criação

# 5. Importar schema
mysql -u grafica_user -p grafica_crm < database/schema.sql

# 6. Configurar .env
cp .env.example .env
nano .env  # PORT=3001

# 7. Gerar senha
node scripts/generate-hash.js admin123
# Atualizar no banco

# 8. Iniciar com PM2
pm2 start server.js --name grafica-crm
pm2 save

# 9. Configurar Nginx
nano /etc/nginx/sites-available/grafica-crm
ln -s /etc/nginx/sites-available/grafica-crm /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

# 10. Configurar DNS no painel Hostinger

# 11. Instalar SSL
certbot --nginx -d crm.seudominio.com
```

---

**Pronto! Seu CRM estará rodando ao lado do precompeonato sem conflitos.**
