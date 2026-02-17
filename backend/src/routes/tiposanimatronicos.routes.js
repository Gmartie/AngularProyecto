const express = require('express');
const router = express.Router();
const tiposanimatronicosController = require('../controllers/tiposanimatronicos.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { upload, handleMulterError } = require('../middleware/upload.middleware');
const { crearTiposAnimatronicosValidator } = require('../validators/tiposanimatronicos.validator');
const validate = require('../middleware/validation.middleware');

// Multer para el icono de tipo
const uploadIcono = upload.fields([{ name: 'icono', maxCount: 1 }]);

router.get('/', authMiddleware, tiposanimatronicosController.getAll);
router.get('/:id', authMiddleware, tiposanimatronicosController.getById);
router.post('/', authMiddleware, uploadIcono, handleMulterError, crearTiposAnimatronicosValidator, validate, tiposanimatronicosController.create);
router.put('/:id', authMiddleware, uploadIcono, handleMulterError, tiposanimatronicosController.update);
router.delete('/:id', authMiddleware, tiposanimatronicosController.delete);

module.exports = router;
