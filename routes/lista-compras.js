const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { auth } = require('../middleware/auth');

// Listar itens
router.get('/', auth, async (req, res) => {
  try {
    const { status, prioridade } = req.query;
    let query = 'SELECT * FROM lista_compras WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (prioridade) {
      query += ' AND prioridade = ?';
      params.push(prioridade);
    }

    query += ' ORDER BY prioridade DESC, criado_em DESC';

    const [itens] = await db.query(query, params);
    res.json(itens);
  } catch (error) {
    console.error('Erro ao listar itens:', error);
    res.status(500).json({ error: 'Erro ao listar itens' });
  }
});

// Buscar item por ID
router.get('/:id', auth, async (req, res) => {
  try {
    const [itens] = await db.query('SELECT * FROM lista_compras WHERE id = ?', [req.params.id]);
    
    if (itens.length === 0) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    res.json(itens[0]);
  } catch (error) {
    console.error('Erro ao buscar item:', error);
    res.status(500).json({ error: 'Erro ao buscar item' });
  }
});

// Adicionar item
router.post('/', auth, async (req, res) => {
  try {
    const { item, quantidade, unidade, prioridade, observacoes } = req.body;
    
    const [result] = await db.query(
      'INSERT INTO lista_compras (item, quantidade, unidade, prioridade, observacoes, criado_por) VALUES (?, ?, ?, ?, ?, ?)',
      [item, quantidade, unidade, prioridade, observacoes, req.user.id]
    );

    res.status(201).json({ id: result.insertId, message: 'Item adicionado com sucesso' });
  } catch (error) {
    console.error('Erro ao adicionar item:', error);
    res.status(500).json({ error: 'Erro ao adicionar item' });
  }
});

// Atualizar status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    await db.query('UPDATE lista_compras SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Status atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ error: 'Erro ao atualizar status' });
  }
});

// Atualizar item
router.put('/:id', auth, async (req, res) => {
  try {
    const { item, quantidade, unidade, prioridade, status, observacoes } = req.body;
    await db.query(
      'UPDATE lista_compras SET item = ?, quantidade = ?, unidade = ?, prioridade = ?, status = ?, observacoes = ? WHERE id = ?',
      [item, quantidade, unidade, prioridade, status, observacoes, req.params.id]
    );
    res.json({ message: 'Item atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar item:', error);
    res.status(500).json({ error: 'Erro ao atualizar item' });
  }
});

// Deletar item
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM lista_compras WHERE id = ?', [req.params.id]);
    res.json({ message: 'Item removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover item:', error);
    res.status(500).json({ error: 'Erro ao remover item' });
  }
});

module.exports = router;
