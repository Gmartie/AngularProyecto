const {body} = require('express-validator');

const crearUsuarioValidator = [
  body('usuario')
    .trim()
    .notEmpty()
    .withMessage('El nombre de usuario es obligatorio'),

  body('pass')
    .isLength({ min: 4 })
    .withMessage('La contraseña debe tener al menos 4 caracteres'),

  body('correo')
    .isEmail()
    .withMessage('Debe ser un correo electrónico válido'),

  body('id_rol')
    .isInt({ min: 1 })
    .withMessage('El id_rol debe ser un entero válido')
];

module.exports = { crearUsuarioValidator };
