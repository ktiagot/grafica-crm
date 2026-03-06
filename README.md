# Sistema de Gestão Comercial para Gráfica

Sistema completo de CRM desenvolvido com Node.js, Express e MySQL para gestão comercial de gráficas.

## Funcionalidades

- Cadastro completo de clientes
- Gestão de orçamentos com controle de status
- Gestão de pedidos e vendas
- Controle de pagamentos e inadimplência
- Sistema de metas comerciais (mensal/anual)
- Relatórios com gráficos
- Controle simplificado de estoque (lista de compras)
- Sistema de autenticação seguro
- Perfis de usuário (Administrador/Vendedor)

## Segurança

- Senhas criptografadas com bcrypt
- JWT para autenticação
- Proteção contra SQL Injection (prepared statements)
- Proteção contra XSS e CSRF
- Rate limiting para prevenir ataques
- Bloqueio após tentativas inválidas de login
- Helmet.js para headers de segurança

## Instalação

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar banco de dados
- Criar banco MySQL na Hostinger
- Importar o arquivo `database/schema.sql`
- Copiar `.env.example` para `.env` e configurar credenciais

### 3. Configurar variáveis de ambiente
Edite o arquivo `.env`:
```
DB_HOST=seu_host_mysql
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=grafica_crm
JWT_SECRET=gere_uma_chave_forte_aqui
```

### 4. Iniciar servidor
```bash
npm start
```

Para desenvolvimento:
```bash
npm run dev
```

## Deploy na Hostinger VPS

### 1. Conectar via SSH
```bash
ssh usuario@seu_vps_ip
```

### 2. Instalar Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 3. Clonar projeto
```bash
cd /var/www
git clone seu_repositorio grafica-crm
cd grafica-crm
npm install
```

### 4. Configurar PM2 (gerenciador de processos)
```bash
sudo npm install -g pm2
pm2 start server.js --name grafica-crm
pm2 startup
pm2 save
```

### 5. Configurar Nginx como proxy reverso
```nginx
server {
    listen 80;
    server_name seu_dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 6. Configurar SSL (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d seu_dominio.com
```

## Usuário Padrão

- Email: admin@grafica.com
- Senha: admin123

**IMPORTANTE:** Altere a senha após primeiro login!

## Estrutura do Projeto

```
grafica-crm/
├── config/          # Configurações (database)
├── middleware/      # Middlewares (auth, security, validator)
├── routes/          # Rotas da API
├── database/        # Schema SQL
├── public/          # Frontend (HTML/CSS/JS)
└── server.js        # Servidor principal
```

## API Endpoints

### Autenticação
- POST `/api/auth/login` - Login

### Clientes
- GET `/api/clientes` - Listar clientes
- GET `/api/clientes/:id` - Buscar cliente
- POST `/api/clientes` - Criar cliente
- PUT `/api/clientes/:id` - Atualizar cliente

### Orçamentos
- GET `/api/orcamentos` - Listar orçamentos
- GET `/api/orcamentos/:id` - Buscar orçamento
- POST `/api/orcamentos` - Criar orçamento
- PATCH `/api/orcamentos/:id/status` - Atualizar status

### Pedidos
- GET `/api/pedidos` - Listar pedidos
- POST `/api/pedidos` - Criar pedido
- POST `/api/pedidos/:id/pagamentos` - Registrar pagamento

### Metas
- GET `/api/metas` - Listar metas
- POST `/api/metas` - Criar/atualizar meta

### Relatórios
- GET `/api/relatorios/vendas-mensal` - Relatório de vendas
- GET `/api/relatorios/inadimplencia` - Relatório de inadimplência

## Suporte

Para dúvidas ou problemas, consulte a documentação ou entre em contato.
