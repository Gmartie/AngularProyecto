const { body, param } = require('express-validator');

const crearAnimatronicosValidator = [
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('El nombre es obligatorio')
    .isLength({ max: 255 })
    .withMessage('El nombre no puede superar 255 caracteres'),

  body('reconocimiento')
    .optional()
    .isIn(['true', 'false', true, false])
    .withMessage('El reconocimiento debe ser true o false'),

  body('num_piezas')
    .notEmpty()
    .withMessage('El número de piezas es obligatorio')
    .isNumeric()
    .withMessage('El número de piezas debe ser un número')
    .custom((value) => {
      if (parseInt(value) < 1) {
        throw new Error('El número de piezas debe ser mayor a 0');
      }
      return true;
    })

  // NO validamos id_gama porque se calcula automáticamente en el backend
  // NO validamos foto ni planos porque vienen en req.files, no en req.body
];

module.exports = { crearAnimatronicosValidator };
