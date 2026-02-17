const { body } = require('express-validator');

const crearTiposAnimatronicosValidator = [
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('El nombre es obligatorio')
];

module.exports = { crearTiposAnimatronicosValidator };
