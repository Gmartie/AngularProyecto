const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/tiposanimatronicos.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { creartiposanimatronicosValidator } = require('../validators/tiposanimatronicos.validator');
const validate = require('../middleware/validation.middleware');

// Por ahora solo requerimos autenticación
router.get('/', authMiddleware, tiposanimatronicosController.getAll);
router.get('/:id', authMiddleware, tiposanimatronicosController.getById);
router.post('/', authMiddleware, creartiposanimatronicosValidator, validate, tiposanimatronicosController.create);
router.put('/:id', authMiddleware, tiposanimatronicosController.update);
router.delete('/:id', authMiddleware, tiposanimatronicosController.delete);

module.exports = router;