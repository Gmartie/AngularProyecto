const { body } = require('express-validator');

const crearModuloValidator = [
  body('codigo')
    .trim()
    .notEmpty()
    .withMessage('El codigo es obligatorio'),
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('El nombre es obligatorio'),
  body('horasSemanales')
    .isInt({ min: 1, max: 40 })
    .withMessage('Las horas semanales deben estar entre 1 y 40'),
  body('curso')
    .isIn(['Primero', 'Segundo'])
    .withMessage('El curso debe ser Primero o Segundo')
];

module.exports = { crearModuloValidator };