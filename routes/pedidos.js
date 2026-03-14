const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { auth } = require('../middleware/auth');

// Listar pedidos
router.get('/', auth, async (req, res) => {
  try {
    const { status, status_pagamento, vendedor_id, data_inicio, data_fim } = req.query;
    let query = `
      SELECT p.*, c.nome as cliente_nome, u.nome as vendedor_nome
      FROM pedidos p
      JOIN clientes c ON p.cliente_id = c.id
      JOIN usuarios u ON p.vendedor_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND p.status = ?';
      params.push(status);
    }

    if (status_pagamento) {
      query += ' AND p.status_pagamento = ?';
      params.push(status_pagamento);
    }

    if (vendedor_id) {
      query += ' AND p.vendedor_id = ?';
      params.push(vendedor_id);
    }

    if (data_inicio && data_fim) {
      query += ' AND p.data_pedido BETWEEN ? AND ?';
      params.push(data_inicio, data_fim);
    }

    query += ' ORDER BY p.data_pedido DESC';

    const [pedidos] = await db.query(query, params);
    res.json(pedidos);
  } catch (error) {
    console.error('Erro ao listar pedidos:', error);
    res.status(500).json({ error: 'Erro ao listar pedidos' });
  }
});

// Buscar pedido por ID
router.get('/:id', auth, async (req, res) => {
  try {
    const [pedidos] = await db.query(`
      SELECT p.*, c.nome as cliente_nome, u.nome as vendedor_nome
      FROM pedidos p
      JOIN clientes c ON p.cliente_id = c.id
      JOIN usuarios u ON p.vendedor_id = u.id
      WHERE p.id = ?
    `, [req.params.id]);
    
    if (pedidos.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    res.json(pedidos[0]);
  } catch (error) {
    console.error('Erro ao buscar pedido:', error);
    res.status(500).json({ error: 'Erro ao buscar pedido' });
  }
});

// Criar pedido
router.post('/', auth, async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { cliente_id, orcamento_id, data_pedido, data_entrega, descricao, observacoes, itens } = req.body;
    
    const [lastPed] = await connection.query('SELECT numero FROM pedidos ORDER BY id DESC LIMIT 1');
    const lastNum = lastPed.length > 0 ? parseInt(lastPed[0].numero.split('-')[1]) : 0;
    const numero = `PED-${String(lastNum + 1).padStart(6, '0')}`;

    const valor_total = itens.reduce((sum, item) => sum + (item.quantidade * item.valor_unitario), 0);

    const [result] = await connection.query(
      `INSERT INTO pedidos (numero, orcamento_id, cliente_id, vendedor_id, data_pedido, data_entrega, descricao, valor_total, observacoes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [numero, orcamento_id, cliente_id, req.user.id, data_pedido, data_entrega, descricao, valor_total, observacoes]
    );

    const pedido_id = result.insertId;

    for (const item of itens) {
      await connection.query(
        'INSERT INTO pedido_itens (pedido_id, descricao, quantidade, valor_unitario, valor_total) VALUES (?, ?, ?, ?, ?)',
        [pedido_id, item.descricao, item.quantidade, item.valor_unitario, item.quantidade * item.valor_unitario]
      );
    }

    await connection.commit();
    res.status(201).json({ id: pedido_id, numero, message: 'Pedido criado com sucesso' });
  } catch (error) {
    await connection.rollback();
    console.error('Erro ao criar pedido:', error);
    res.status(500).json({ error: 'Erro ao criar pedido' });
  } finally {
    connection.release();
  }
});

// Registrar pagamento
router.post('/:id/pagamentos', auth, async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { data_pagamento, valor, forma_pagamento, observacoes } = req.body;
    
    await connection.query(
      'INSERT INTO pagamentos (pedido_id, data_pagamento, valor, forma_pagamento, observacoes, criado_por) VALUES (?, ?, ?, ?, ?, ?)',
      [req.params.id, data_pagamento, valor, forma_pagamento, observacoes, req.user.id]
    );

    const [pagamentos] = await connection.query('SELECT SUM(valor) as total FROM pagamentos WHERE pedido_id = ?', [req.params.id]);
    const [pedido] = await connection.query('SELECT valor_total FROM pedidos WHERE id = ?', [req.params.id]);
    
    const totalPago = pagamentos[0].total || 0;
    const valorPedido = pedido[0].valor_total;
    
    let status_pagamento = 'pendente';
    if (totalPago >= valorPedido) {
      status_pagamento = 'pago';
    } else if (totalPago > 0) {
      status_pagamento = 'parcial';
    }

    await connection.query('UPDATE pedidos SET valor_pago = ?, status_pagamento = ? WHERE id = ?', [totalPago, status_pagamento, req.params.id]);

    await connection.commit();
    res.status(201).json({ message: 'Pagamento registrado com sucesso' });
  } catch (error) {
    await connection.rollback();
    console.error('Erro ao registrar pagamento:', error);
    res.status(500).json({ error: 'Erro ao registrar pagamento' });
  } finally {
    connection.release();
  }
});

// Atualizar pedido
router.put('/:id', auth, async (req, res) => {
  try {
    const { numero, cliente_id, data_pedido, data_entrega, descricao, valor_total, status, status_pagamento, valor_pago, observacoes } = req.body;
    
    await db.query(
      `UPDATE pedidos SET numero = ?, cliente_id = ?, data_pedido = ?, data_entrega = ?, descricao = ?, valor_total = ?, status = ?, status_pagamento = ?, valor_pago = ?, observacoes = ? WHERE id = ?`,
      [numero, cliente_id, data_pedido, data_entrega, descricao, valor_total, status, status_pagamento, valor_pago, observacoes, req.params.id]
    );

    res.json({ message: 'Pedido atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar pedido:', error);
    res.status(500).json({ error: 'Erro ao atualizar pedido' });
  }
});

// Deletar pedido
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM pedido_itens WHERE pedido_id = ?', [req.params.id]);
    await db.query('DELETE FROM pagamentos WHERE pedido_id = ?', [req.params.id]);
    await db.query('DELETE FROM pedidos WHERE id = ?', [req.params.id]);
    res.json({ message: 'Pedido deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar pedido:', error);
    res.status(500).json({ error: 'Erro ao deletar pedido' });
  }
});

module.exports = router;
