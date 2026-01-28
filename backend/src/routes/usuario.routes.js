const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuario.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { crearUsuarioValidator } = require('../validators/usuario.validator');
const validate = require('../middleware/validation.middleware');

// Por ahora solo requerimos autenticación
router.get('/', authMiddleware, usuarioController.getAll);
router.get('/:id', authMiddleware, usuarioController.getById);
router.post('/', authMiddleware, crearUsuarioValidator, validate, usuarioController.create);
router.put('/:id', authMiddleware, usuarioController.update);
router.delete('/:id', authMiddleware, usuarioController.delete);

module.exports = router;