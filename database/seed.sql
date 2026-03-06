-- Dados de exemplo para testes
USE grafica_crm;

-- Usuário administrador (senha: admin123)
-- Hash gerado com bcrypt rounds=10
INSERT INTO usuarios (nome, email, senha, perfil) VALUES 
('Administrador', 'admin@grafica.com', '$2b$10$YourHashHere', 'administrador'),
('João Vendedor', 'joao@grafica.com', '$2b$10$YourHashHere', 'vendedor');

-- Clientes de exemplo
INSERT INTO clientes (nome, razao_social, cnpj_cpf, email, telefone, celular, cidade, estado, criado_por) VALUES
('Empresa ABC Ltda', 'ABC Comércio e Serviços Ltda', '12.345.678/0001-90', 'contato@abc.com', '(11) 3333-4444', '(11) 98888-7777', 'São Paulo', 'SP', 1),
('Maria Silva', 'Maria Silva ME', '123.456.789-00', 'maria@email.com', '(11) 2222-3333', '(11) 97777-6666', 'São Paulo', 'SP', 1),
('Empresa XYZ', 'XYZ Indústria e Comércio', '98.765.432/0001-10', 'contato@xyz.com', '(11) 4444-5555', '(11) 96666-5555', 'Guarulhos', 'SP', 1);

-- Metas de exemplo
INSERT INTO metas (usuario_id, mes, ano, valor_meta, tipo) VALUES
(2, 1, 2026, 50000.00, 'mensal'),
(2, 2, 2026, 55000.00, 'mensal'),
(2, 3, 2026, 60000.00, 'mensal');

-- Orçamentos de exemplo
INSERT INTO orcamentos (numero, cliente_id, vendedor_id, data_orcamento, validade, descricao, valor_total, status) VALUES
('ORC-000001', 1, 2, '2026-03-01', '2026-03-15', 'Impressão de 1000 folders', 1500.00, 'aprovado'),
('ORC-000002', 2, 2, '2026-03-02', '2026-03-16', 'Cartões de visita', 350.00, 'pendente'),
('ORC-000003', 3, 2, '2026-03-03', '2026-03-17', 'Banner 2x1m', 280.00, 'aprovado');

-- Itens dos orçamentos
INSERT INTO orcamento_itens (orcamento_id, descricao, quantidade, valor_unitario, valor_total) VALUES
(1, 'Folder A4 4x4 cores', 1000, 1.50, 1500.00),
(2, 'Cartão de visita 4x4 verniz', 500, 0.70, 350.00),
(3, 'Banner lona 2x1m', 1, 280.00, 280.00);

-- Pedidos de exemplo
INSERT INTO pedidos (numero, orcamento_id, cliente_id, vendedor_id, data_pedido, data_entrega, descricao, valor_total, status, status_pagamento, valor_pago) VALUES
('PED-000001', 1, 1, 2, '2026-03-01', '2026-03-05', 'Impressão de 1000 folders', 1500.00, 'entregue', 'pago', 1500.00),
('PED-000002', 3, 3, 2, '2026-03-03', '2026-03-06', 'Banner 2x1m', 280.00, 'producao', 'pendente', 0.00);

-- Itens dos pedidos
INSERT INTO pedido_itens (pedido_id, descricao, quantidade, valor_unitario, valor_total) VALUES
(1, 'Folder A4 4x4 cores', 1000, 1.50, 1500.00),
(2, 'Banner lona 2x1m', 1, 280.00, 280.00);

-- Pagamentos
INSERT INTO pagamentos (pedido_id, data_pagamento, valor, forma_pagamento, criado_por) VALUES
(1, '2026-03-01', 1500.00, 'pix', 2);

-- Lista de compras
INSERT INTO lista_compras (item, quantidade, unidade, prioridade, status, criado_por) VALUES
('Papel Couché 170g A4', '5', 'resmas', 'alta', 'pendente', 1),
('Tinta ciano para impressora', '2', 'litros', 'media', 'pendente', 1),
('Lona para banner', '10', 'metros', 'baixa', 'comprado', 1);
