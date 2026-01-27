const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/locales.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { crearlocalesValidator } = require('../validators/locales.validator');
const validate = require('../middleware/validation.middleware');

// Por ahora solo requerimos autenticación
router.get('/', authMiddleware, localesController.getAll);
router.get('/:id', authMiddleware, localesController.getById);
router.post('/', authMiddleware, crearlocalesValidator, validate, localesController.create);
router.put('/:id', authMiddleware, localesController.update);
router.delete('/:id', authMiddleware, localesController.delete);

module.exports = router;