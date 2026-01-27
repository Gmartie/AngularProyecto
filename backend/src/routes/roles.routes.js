const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/roles.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { crearrolesValidator } = require('../validators/roles.validator');
const validate = require('../middleware/validation.middleware');

// Por ahora solo requerimos autenticación
router.get('/', authMiddleware, rolesController.getAll);
router.get('/:id', authMiddleware, rolesController.getById);
router.post('/', authMiddleware, crearrolesValidator, validate, rolesController.create);
router.put('/:id', authMiddleware, rolesController.update);
router.delete('/:id', authMiddleware, rolesController.delete);

module.exports = router;