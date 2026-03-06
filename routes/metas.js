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

// Criar/Atualizar meta
router.post('/', auth, isAdmin, async (req, res) => {
  try {
    const { usuario_id, mes, ano, valor_meta, tipo } = req.body;
    
    await db.query(
      `INSERT INTO metas (usuario_id, mes, ano, valor_meta, tipo) 
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE valor_meta = ?`,
      [usuario_id, mes, ano, valor_meta, tipo, valor_meta]
    );

    res.status(201).json({ message: 'Meta salva com sucesso' });
  } catch (error) {
    console.error('Erro ao salvar meta:', error);
    res.status(500).json({ error: 'Erro ao salvar meta' });
  }
});

module.exports = router;
