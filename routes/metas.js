const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { auth, isAdmin } = require('../middleware/auth');

// Listar metas
router.get('/', auth, async (req, res) => {
  try {
    const { usuario_id, mes, ano } = req.query;
    let query = 'SELECT m.*, u.nome as usuario_nome FROM metas m JOIN usuarios u ON m.usuario_id = u.id WHERE 1=1';
    const params = [];

    if (usuario_id) {
      query += ' AND m.usuario_id = ?';
      params.push(usuario_id);
    }

    if (mes) {
      query += ' AND m.mes = ?';
      params.push(mes);
    }

    if (ano) {
      query += ' AND m.ano = ?';
      params.push(ano);
    }

    query += ' ORDER BY m.ano DESC, m.mes DESC';

    const [metas] = await db.query(query, params);
    res.json(metas);
  } catch (error) {
    console.error('Erro ao listar metas:', error);
    res.status(500).json({ error: 'Erro ao listar metas' });
  }
});

// Buscar meta por ID
router.get('/:id', auth, async (req, res) => {
  try {
    const [metas] = await db.query('SELECT * FROM metas WHERE id = ?', [req.params.id]);
    
    if (metas.length === 0) {
      return res.status(404).json({ error: 'Meta não encontrada' });
    }

    res.json(metas[0]);
  } catch (error) {
    console.error('Erro ao buscar meta:', error);
    res.status(500).json({ error: 'Erro ao buscar meta' });
  }
});

// Criar/Atualizar meta
router.post('/', auth, async (req, res) => {
  try {
    const { usuario_id, mes, ano, valor_meta, tipo } = req.body;
    
    const [result] = await db.query(
      `INSERT INTO metas (usuario_id, mes, ano, valor_meta, tipo) 
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE valor_meta = ?, tipo = ?`,
      [usuario_id, mes, ano, valor_meta, tipo, valor_meta, tipo]
    );

    res.status(201).json({ id: result.insertId, message: 'Meta salva com sucesso' });
  } catch (error) {
    console.error('Erro ao salvar meta:', error);
    res.status(500).json({ error: 'Erro ao salvar meta' });
  }
});

// Atualizar meta
router.put('/:id', auth, async (req, res) => {
  try {
    const { usuario_id, mes, ano, valor_meta, tipo } = req.body;
    
    await db.query(
      `UPDATE metas SET usuario_id = ?, mes = ?, ano = ?, valor_meta = ?, tipo = ? WHERE id = ?`,
      [usuario_id, mes, ano, valor_meta, tipo, req.params.id]
    );

    res.json({ message: 'Meta atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar meta:', error);
    res.status(500).json({ error: 'Erro ao atualizar meta' });
  }
});

// Deletar meta
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM metas WHERE id = ?', [req.params.id]);
    res.json({ message: 'Meta deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar meta:', error);
    res.status(500).json({ error: 'Erro ao deletar meta' });
  }
});

module.exports = router;
