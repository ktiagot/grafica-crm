const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { apiLimiter, loginLimiter } = require('./middleware/security');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api/', apiLimiter);

// API Routes
app.use('/api/auth', loginLimiter, require('./routes/auth'));
app.use('/api/clientes', require('./routes/clientes'));
app.use('/api/orcamentos', require('./routes/orcamentos'));
app.use('/api/pedidos', require('./routes/pedidos'));
app.use('/api/metas', require('./routes/metas'));
app.use('/api/relatorios', require('./routes/relatorios'));
app.use('/api/lista-compras', require('./routes/lista-compras'));

// Rotas HTML específicas (antes do static para ter prioridade)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/app.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'app.html'));
});

// Servir arquivos estáticos (CSS, JS, imagens)
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV}`);
});
