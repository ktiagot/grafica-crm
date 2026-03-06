const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('senha').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
  validate
];

const clienteValidation = [
  body('nome').trim().notEmpty().withMessage('Nome é obrigatório'),
  body('email').optional().isEmail().normalizeEmail(),
  body('cnpj_cpf').optional().trim(),
  validate
];

const orcamentoValidation = [
  body('cliente_id').isInt().withMessage('Cliente inválido'),
  body('data_orcamento').isDate().withMessage('Data inválida'),
  body('valor_total').isFloat({ min: 0 }).withMessage('Valor inválido'),
  validate
];

module.exports = {
  loginValidation,
  clienteValidation,
  orcamentoValidation,
  validate
};
