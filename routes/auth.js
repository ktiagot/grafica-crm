const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { loginValidation } = require('../middleware/validator');

// Login
router.post('/login', loginValidation, async (req, res) => {
  try {
    const { email, senha } = req.body;
    
    const [users] = await db.query(
      'SELECT * FROM usuarios WHERE email = ? AND ativo = TRUE',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const user = users[0];

    // Verificar se está bloqueado
    if (user.bloqueado_ate && new Date(user.bloqueado_ate) > new Date()) {
      return res.status(403).json({ error: 'Conta temporariamente bloqueada' });
    }

    const senhaValida = await bcrypt.compare(senha, user.senha);

    if (!senhaValida) {
      // Incrementar tentativas
      await db.query(
        'UPDATE usuarios SET tentativas_login = tentativas_login + 1 WHERE id = ?',
        [user.id]
      );

      if (user.tentativas_login + 1 >= 5) {
        const lockTime = new Date(Date.now() + 15 * 60 * 1000);
        await db.query(
          'UPDATE usuarios SET bloqueado_ate = ? WHERE id = ?',
          [lockTime, user.id]
        );
        return res.status(403).json({ error: 'Conta bloqueada por 15 minutos' });
      }

      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Reset tentativas
    await db.query(
      'UPDATE usuarios SET tentativas_login = 0, bloqueado_ate = NULL WHERE id = ?',
      [user.id]
    );

    const token = jwt.sign(
      { id: user.id, email: user.email, perfil: user.perfil },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        perfil: user.perfil
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

module.exports = router;
