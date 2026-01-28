const {body} = require('express-validator');

const crearLocalValidator = [
  body('fecha_aperetura')
    .isDate()
    .withMessage('La fecha de apertura debe ser una fecha válida'),

  body('aforo')
    .isInt({ min: 1 })
    .withMessage('El aforo debe ser un número entero positivo'),

  body('foto')
    .trim()
    .notEmpty()
    .withMessage('La foto es obligatoria'),

  body('ciudad')
    .trim()
    .notEmpty()
    .withMessage('La ciudad es obligatoria'),

  body('direccion')
    .trim()
    .notEmpty()
    .withMessage('La dirección es obligatoria'),

  body('abierto')
    .isBoolean()
    .withMessage('El campo abierto debe ser true o false')
];

module.exports = { crearLocalValidator };
