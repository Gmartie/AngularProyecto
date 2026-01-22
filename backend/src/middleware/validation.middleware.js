const { validationResult } = require('express-validator');
const ResponseUtil = require('../utils/response.util');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return ResponseUtil.error(
      res,
      'Errores de validacion',
      400,
      errors.array()
    );
  }
  
  next();
};

module.exports = validate;