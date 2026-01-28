const {body} = require('express-validator');

const crearTiposAnimatronicosValidator = [
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('El nombre es obligatorio'),

  body('id_local')
    .isInt({ min: 1 })
    .withMessage('El id_local debe ser un entero válido')
];

module.exports = { crearTiposAnimatronicosValidator };
