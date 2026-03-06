const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { auth } = require('../middleware/auth');

// Relatório de vendas mensal
router.get('/vendas-mensal', auth, async (req, res) => {
  try {
    const { mes, ano, vendedor_id } = req.query;
    
    let query = `
      SELECT 
        DATE_FORMAT(p.data_pedido, '%Y-%m') as periodo,
        COUNT(*) as total_pedidos,
        SUM(p.valor_total) as valor_total,
        SUM(p.valor_pago) as valor_pago,
        SUM(p.valor_total - p.valor_pago) as valor_pendente
      FROM pedidos p
      WHERE MONTH(p.data_pedido) = ? AND YEAR(p.data_pedido) = ?
    `;
    const params = [mes, ano];

    if (vendedor_id) {
      query += ' AND p.vendedor_id = ?';
      params.push(vendedor_id);
    }

    query += ' GROUP BY periodo';

    const [resultado] = await db.query(query, params);
    
    // Buscar meta do período
    const [meta] = await db.query(
      'SELECT SUM(valor_meta) as meta_total FROM metas WHERE mes = ? AND ano = ?',
      [mes, ano]
    );

    res.json({
      ...resultado[0],
      meta: meta[0]?.meta_total || 0,
      percentual_meta: meta[0]?.meta_total ? (resultado[0]?.valor_total / meta[0].meta_total * 100).toFixed(2) : 0
    });
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
});

// Relatório de inadimplência
router.get('/inadimplencia', auth, async (req, res) => {
  try {
    const [resultado] = await db.query(`
      SELECT 
        p.id, p.numero, p.data_pedido, p.valor_total, p.valor_pago,
        (p.valor_total - p.valor_pago) as valor_pendente,
        c.nome as cliente_nome, c.telefone, c.celular,
        u.nome as vendedor_nome
      FROM pedidos p
      JOIN clientes c ON p.cliente_id = c.id
      JOIN usuarios u ON p.vendedor_id = u.id
      WHERE p.status_pagamento IN ('pendente', 'parcial', 'atrasado')
      AND p.status != 'cancelado'
      ORDER BY p.data_pedido
    `);

    const total_inadimplente = resultado.reduce((sum, p) => sum + parseFloat(p.valor_pendente), 0);

    res.json({ inadimplentes: resultado, total_inadimplente });
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
});

module.exports = router;
