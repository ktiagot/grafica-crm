const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { auth } = require('../middleware/auth');
const { clienteValidation } = require('../middleware/validator');

// Listar clientes
router.get('/', auth, async (req, res) => {
  try {
    const { ativo, busca } = req.query;
    let query = 'SELECT * FROM clientes WHERE 1=1';
    const params = [];

    if (ativo !== undefined) {
      query += ' AND ativo = ?';
      params.push(ativo === 'true');
    }

    if (busca) {
      query += ' AND (nome LIKE ? OR razao_social LIKE ? OR cnpj_cpf LIKE ?)';
      const searchTerm = `%${busca}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY nome';

    const [clientes] = await db.query(query, params);
    res.json(clientes);
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    res.status(500).json({ error: 'Erro ao listar clientes' });
  }
});

// Buscar cliente por ID
router.get('/:id', auth, async (req, res) => {
  try {
    const [clientes] = await db.query('SELECT * FROM clientes WHERE id = ?', [req.params.id]);
    
    if (clientes.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json(clientes[0]);
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({ error: 'Erro ao buscar cliente' });
  }
});

// Criar cliente
router.post('/', auth, clienteValidation, async (req, res) => {
  try {
    const { nome, razao_social, cnpj_cpf, email, telefone, celular, endereco, cidade, estado, cep, observacoes } = req.body;
    
    const [result] = await db.query(
      `INSERT INTO clientes (nome, razao_social, cnpj_cpf, email, telefone, celular, endereco, cidade, estado, cep, observacoes, criado_por)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nome, razao_social, cnpj_cpf, email, telefone, celular, endereco, cidade, estado, cep, observacoes, req.user.id]
    );

    res.status(201).json({ id: result.insertId, message: 'Cliente criado com sucesso' });
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({ error: 'Erro ao criar cliente' });
  }
});

// Atualizar cliente
router.put('/:id', auth, clienteValidation, async (req, res) => {
  try {
    const { nome, razao_social, cnpj_cpf, email, telefone, celular, endereco, cidade, estado, cep, observacoes, ativo } = req.body;
    
    await db.query(
      `UPDATE clientes SET nome = ?, razao_social = ?, cnpj_cpf = ?, email = ?, telefone = ?, celular = ?, 
       endereco = ?, cidade = ?, estado = ?, cep = ?, observacoes = ?, ativo = ? WHERE id = ?`,
      [nome, razao_social, cnpj_cpf, email, telefone, celular, endereco, cidade, estado, cep, observacoes, ativo, req.params.id]
    );

    res.json({ message: 'Cliente atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ error: 'Erro ao atualizar cliente' });
  }
});

// Deletar cliente
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM clientes WHERE id = ?', [req.params.id]);
    res.json({ message: 'Cliente deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    res.status(500).json({ error: 'Erro ao deletar cliente' });
  }
});

module.exports = router;
