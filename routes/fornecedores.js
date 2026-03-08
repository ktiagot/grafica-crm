const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { auth } = require('../middleware/auth');

// Listar fornecedores
router.get('/', auth, async (req, res) => {
  try {
    const { ativo, busca } = req.query;
    let query = 'SELECT * FROM fornecedores WHERE 1=1';
    const params = [];

    if (ativo !== undefined) {
      query += ' AND ativo = ?';
      params.push(ativo === 'true');
    }

    if (busca) {
      query += ' AND (nome LIKE ? OR razao_social LIKE ? OR cnpj LIKE ?)';
      const searchTerm = `%${busca}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY nome';

    const [fornecedores] = await db.query(query, params);
    res.json(fornecedores);
  } catch (error) {
    console.error('Erro ao listar fornecedores:', error);
    res.status(500).json({ error: 'Erro ao listar fornecedores' });
  }
});

// Buscar fornecedor por ID
router.get('/:id', auth, async (req, res) => {
  try {
    const [fornecedores] = await db.query('SELECT * FROM fornecedores WHERE id = ?', [req.params.id]);
    
    if (fornecedores.length === 0) {
      return res.status(404).json({ error: 'Fornecedor não encontrado' });
    }

    res.json(fornecedores[0]);
  } catch (error) {
    console.error('Erro ao buscar fornecedor:', error);
    res.status(500).json({ error: 'Erro ao buscar fornecedor' });
  }
});

// Criar fornecedor
router.post('/', auth, async (req, res) => {
  try {
    const { nome, razao_social, cnpj, email, telefone, celular, endereco, cidade, estado, cep, contato_nome, observacoes } = req.body;
    
    const [result] = await db.query(
      `INSERT INTO fornecedores (nome, razao_social, cnpj, email, telefone, celular, endereco, cidade, estado, cep, contato_nome, observacoes, criado_por)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nome, razao_social, cnpj, email, telefone, celular, endereco, cidade, estado, cep, contato_nome, observacoes, req.user.id]
    );

    res.status(201).json({ id: result.insertId, message: 'Fornecedor criado com sucesso' });
  } catch (error) {
    console.error('Erro ao criar fornecedor:', error);
    res.status(500).json({ error: 'Erro ao criar fornecedor' });
  }
});

// Atualizar fornecedor
router.put('/:id', auth, async (req, res) => {
  try {
    const { nome, razao_social, cnpj, email, telefone, celular, endereco, cidade, estado, cep, contato_nome, observacoes, ativo } = req.body;
    
    await db.query(
      `UPDATE fornecedores SET nome = ?, razao_social = ?, cnpj = ?, email = ?, telefone = ?, celular = ?, 
       endereco = ?, cidade = ?, estado = ?, cep = ?, contato_nome = ?, observacoes = ?, ativo = ? WHERE id = ?`,
      [nome, razao_social, cnpj, email, telefone, celular, endereco, cidade, estado, cep, contato_nome, observacoes, ativo, req.params.id]
    );

    res.json({ message: 'Fornecedor atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar fornecedor:', error);
    res.status(500).json({ error: 'Erro ao atualizar fornecedor' });
  }
});

// Deletar fornecedor
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM fornecedores WHERE id = ?', [req.params.id]);
    res.json({ message: 'Fornecedor deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar fornecedor:', error);
    res.status(500).json({ error: 'Erro ao deletar fornecedor' });
  }
});

module.exports = router;
