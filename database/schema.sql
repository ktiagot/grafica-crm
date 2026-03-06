-- Sistema de Gestão Comercial para Gráfica
-- Database Schema

CREATE DATABASE IF NOT EXISTS grafica_crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE grafica_crm;

-- Tabela de Usuários
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    perfil ENUM('administrador', 'vendedor') DEFAULT 'vendedor',
    ativo BOOLEAN DEFAULT TRUE,
    tentativas_login INT DEFAULT 0,
    bloqueado_ate DATETIME NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_perfil (perfil)
) ENGINE=InnoDB;

-- Tabela de Clientes
CREATE TABLE clientes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(150) NOT NULL,
    razao_social VARCHAR(200),
    cnpj_cpf VARCHAR(18),
    email VARCHAR(100),
    telefone VARCHAR(20),
    celular VARCHAR(20),
    endereco TEXT,
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(10),
    observacoes TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    criado_por INT,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (criado_por) REFERENCES usuarios(id),
    INDEX idx_nome (nome),
    INDEX idx_cnpj_cpf (cnpj_cpf),
    INDEX idx_ativo (ativo)
) ENGINE=InnoDB;

-- Tabela de Metas
CREATE TABLE metas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT,
    mes INT NOT NULL,
    ano INT NOT NULL,
    valor_meta DECIMAL(10,2) NOT NULL,
    tipo ENUM('mensal', 'anual') DEFAULT 'mensal',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE KEY unique_meta (usuario_id, mes, ano, tipo),
    INDEX idx_periodo (ano, mes)
) ENGINE=InnoDB;

-- Tabela de Orçamentos
CREATE TABLE orcamentos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    numero VARCHAR(20) UNIQUE NOT NULL,
    cliente_id INT NOT NULL,
    vendedor_id INT NOT NULL,
    data_orcamento DATE NOT NULL,
    validade DATE,
    descricao TEXT,
    valor_total DECIMAL(10,2) NOT NULL DEFAULT 0,
    status ENUM('pendente', 'aprovado', 'rejeitado', 'expirado') DEFAULT 'pendente',
    observacoes TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (vendedor_id) REFERENCES usuarios(id),
    INDEX idx_numero (numero),
    INDEX idx_cliente (cliente_id),
    INDEX idx_vendedor (vendedor_id),
    INDEX idx_status (status),
    INDEX idx_data (data_orcamento)
) ENGINE=InnoDB;

-- Tabela de Itens do Orçamento
CREATE TABLE orcamento_itens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    orcamento_id INT NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    quantidade INT NOT NULL DEFAULT 1,
    valor_unitario DECIMAL(10,2) NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (orcamento_id) REFERENCES orcamentos(id) ON DELETE CASCADE,
    INDEX idx_orcamento (orcamento_id)
) ENGINE=InnoDB;

-- Tabela de Pedidos/Vendas
CREATE TABLE pedidos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    numero VARCHAR(20) UNIQUE NOT NULL,
    orcamento_id INT,
    cliente_id INT NOT NULL,
    vendedor_id INT NOT NULL,
    data_pedido DATE NOT NULL,
    data_entrega DATE,
    descricao TEXT,
    valor_total DECIMAL(10,2) NOT NULL DEFAULT 0,
    status ENUM('pendente', 'producao', 'finalizado', 'entregue', 'cancelado') DEFAULT 'pendente',
    status_pagamento ENUM('pendente', 'parcial', 'pago', 'atrasado') DEFAULT 'pendente',
    valor_pago DECIMAL(10,2) DEFAULT 0,
    observacoes TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (orcamento_id) REFERENCES orcamentos(id),
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (vendedor_id) REFERENCES usuarios(id),
    INDEX idx_numero (numero),
    INDEX idx_cliente (cliente_id),
    INDEX idx_vendedor (vendedor_id),
    INDEX idx_status (status),
    INDEX idx_status_pagamento (status_pagamento),
    INDEX idx_data (data_pedido)
) ENGINE=InnoDB;

-- Tabela de Itens do Pedido
CREATE TABLE pedido_itens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pedido_id INT NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    quantidade INT NOT NULL DEFAULT 1,
    valor_unitario DECIMAL(10,2) NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    INDEX idx_pedido (pedido_id)
) ENGINE=InnoDB;

-- Tabela de Pagamentos
CREATE TABLE pagamentos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pedido_id INT NOT NULL,
    data_pagamento DATE NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    forma_pagamento ENUM('dinheiro', 'pix', 'cartao_credito', 'cartao_debito', 'boleto', 'transferencia') NOT NULL,
    observacoes TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    criado_por INT,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (criado_por) REFERENCES usuarios(id),
    INDEX idx_pedido (pedido_id),
    INDEX idx_data (data_pagamento)
) ENGINE=InnoDB;

-- Tabela de Estoque Simplificado (Lista de Compras)
CREATE TABLE lista_compras (
    id INT PRIMARY KEY AUTO_INCREMENT,
    item VARCHAR(255) NOT NULL,
    quantidade VARCHAR(50),
    unidade VARCHAR(20),
    prioridade ENUM('baixa', 'media', 'alta') DEFAULT 'media',
    status ENUM('pendente', 'comprado') DEFAULT 'pendente',
    observacoes TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    criado_por INT,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (criado_por) REFERENCES usuarios(id),
    INDEX idx_status (status),
    INDEX idx_prioridade (prioridade)
) ENGINE=InnoDB;

-- Inserir usuário administrador padrão (senha: admin123)
INSERT INTO usuarios (nome, email, senha, perfil) VALUES 
('Administrador', 'admin@grafica.com', '$2b$10$rKvVPZhJvXN5xGZqGfJxXeqKZQYJXqYvXqYvXqYvXqYvXqYvXqYvX', 'administrador');
