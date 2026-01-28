const { body, param } = require('express-validator');

const crearAnimatronicosValidator = [
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('El nombre es obligatorio')
    .isLength({ max: 255 })
    .withMessage('El nombre no puede superar 255 caracteres'),

  body('reconocimiento')
    .isBoolean()
    .withMessage('El reconocimiento debe ser true o false'),

  body('num_piezas')
    .isInt({ min: 1 })
    .withMessage('El número de piezas debe ser un entero positivo'),

  body('id_gama')
    .isInt({ min: 1 })
    .withMessage('El id_gama debe ser un entero válido'),

  body('planos')
    .trim()
    .notEmpty()
    .withMessage('Los planos son obligatorios'),

  body('foto')
    .trim()
    .notEmpty()
    .withMessage('La foto es obligatoria')
];

module.exports = { crearAnimatronicosValidator };
