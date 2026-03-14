const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { auth } = require('../middleware/auth');

// Listar orçamentos
router.get('/', auth, async (req, res) => {
  try {
    const { status, vendedor_id, data_inicio, data_fim } = req.query;
    let query = `
      SELECT o.*, c.nome as cliente_nome, u.nome as vendedor_nome
      FROM orcamentos o
      JOIN clientes c ON o.cliente_id = c.id
      JOIN usuarios u ON o.vendedor_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND o.status = ?';
      params.push(status);
    }

    if (vendedor_id) {
      query += ' AND o.vendedor_id = ?';
      params.push(vendedor_id);
    }

    if (data_inicio && data_fim) {
      query += ' AND o.data_orcamento BETWEEN ? AND ?';
      params.push(data_inicio, data_fim);
    }

    query += ' ORDER BY o.data_orcamento DESC';

    const [orcamentos] = await db.query(query, params);
    res.json(orcamentos);
  } catch (error) {
    console.error('Erro ao listar orçamentos:', error);
    res.status(500).json({ error: 'Erro ao listar orçamentos' });
  }
});

// Buscar orçamento por ID com itens
router.get('/:id', auth, async (req, res) => {
  try {
    const [orcamentos] = await db.query(`
      SELECT o.*, c.nome as cliente_nome, u.nome as vendedor_nome
      FROM orcamentos o
      JOIN clientes c ON o.cliente_id = c.id
      JOIN usuarios u ON o.vendedor_id = u.id
      WHERE o.id = ?
    `, [req.params.id]);
    
    if (orcamentos.length === 0) {
      return res.status(404).json({ error: 'Orçamento não encontrado' });
    }

    const [itens] = await db.query('SELECT * FROM orcamento_itens WHERE orcamento_id = ?', [req.params.id]);
    
    res.json({ ...orcamentos[0], itens });
  } catch (error) {
    console.error('Erro ao buscar orçamento:', error);
    res.status(500).json({ error: 'Erro ao buscar orçamento' });
  }
});

// Criar orçamento
router.post('/', auth, async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { cliente_id, data_orcamento, validade, descricao, observacoes, itens } = req.body;
    
    // Gerar número do orçamento
    const [lastOrc] = await connection.query('SELECT numero FROM orcamentos ORDER BY id DESC LIMIT 1');
    const lastNum = lastOrc.length > 0 ? parseInt(lastOrc[0].numero.split('-')[1]) : 0;
    const numero = `ORC-${String(lastNum + 1).padStart(6, '0')}`;

    const valor_total = itens.reduce((sum, item) => sum + (item.quantidade * item.valor_unitario), 0);

    const [result] = await connection.query(
      `INSERT INTO orcamentos (numero, cliente_id, vendedor_id, data_orcamento, validade, descricao, valor_total, observacoes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [numero, cliente_id, req.user.id, data_orcamento, validade, descricao, valor_total, observacoes]
    );

    const orcamento_id = result.insertId;

    // Inserir itens
    for (const item of itens) {
      await connection.query(
        'INSERT INTO orcamento_itens (orcamento_id, descricao, quantidade, valor_unitario, valor_total) VALUES (?, ?, ?, ?, ?)',
        [orcamento_id, item.descricao, item.quantidade, item.valor_unitario, item.quantidade * item.valor_unitario]
      );
    }

    await connection.commit();
    res.status(201).json({ id: orcamento_id, numero, message: 'Orçamento criado com sucesso' });
  } catch (error) {
    await connection.rollback();
    console.error('Erro ao criar orçamento:', error);
    res.status(500).json({ error: 'Erro ao criar orçamento' });
  } finally {
    connection.release();
  }
});

// Atualizar status do orçamento
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    await db.query('UPDATE orcamentos SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Status atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ error: 'Erro ao atualizar status' });
  }
});

// Atualizar orçamento
router.put('/:id', auth, async (req, res) => {
  try {
    const { numero, cliente_id, data_orcamento, validade, descricao, valor_total, status, observacoes } = req.body;
    
    await db.query(
      `UPDATE orcamentos SET numero = ?, cliente_id = ?, data_orcamento = ?, validade = ?, descricao = ?, valor_total = ?, status = ?, observacoes = ? WHERE id = ?`,
      [numero, cliente_id, data_orcamento, validade, descricao, valor_total, status, observacoes, req.params.id]
    );

    res.json({ message: 'Orçamento atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar orçamento:', error);
    res.status(500).json({ error: 'Erro ao atualizar orçamento' });
  }
});

// Deletar orçamento
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM orcamento_itens WHERE orcamento_id = ?', [req.params.id]);
    await db.query('DELETE FROM orcamentos WHERE id = ?', [req.params.id]);
    res.json({ message: 'Orçamento deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar orçamento:', error);
    res.status(500).json({ error: 'Erro ao deletar orçamento' });
  }
});

module.exports = router;
