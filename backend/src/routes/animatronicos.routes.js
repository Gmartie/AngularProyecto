const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/animatronicos.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { crearanimatronicosValidator } = require('../validators/animatronicos.validator');
const validate = require('../middleware/validation.middleware');

// Por ahora solo requerimos autenticación
router.get('/', authMiddleware, animatronicosController.getAll);
router.get('/:id', authMiddleware, animatronicosController.getById);
router.post('/', authMiddleware, crearanimatronicosValidator, validate, animatronicosController.create);
router.put('/:id', authMiddleware, animatronicosController.update);
router.delete('/:id', authMiddleware, animatronicosController.delete);

module.exports = router;