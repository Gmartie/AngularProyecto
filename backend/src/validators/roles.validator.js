const {body} = require('express-validator');

const crearRolesValidator = [
  body('rol')
    .trim()
    .notEmpty()
    .withMessage('El nombre de rol es obligatorio')

];

module.exports = { crearRolesValidator };
