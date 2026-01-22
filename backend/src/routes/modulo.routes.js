const express = require('express');
const router = express.Router();
const moduloController = require('../controllers/modulo.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { crearModuloValidator } = require('../validators/modulo.validator');
const validate = require('../middleware/validation.middleware');

// Por ahora solo requerimos autenticación
router.get('/', authMiddleware, moduloController.getAll);
router.get('/:id', authMiddleware, moduloController.getById);
router.post('/', authMiddleware, crearModuloValidator, validate, moduloController.create);
router.put('/:id', authMiddleware, moduloController.update);
router.delete('/:id', authMiddleware, moduloController.delete);

module.exports = router;