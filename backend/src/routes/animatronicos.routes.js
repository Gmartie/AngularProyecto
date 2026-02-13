const express = require('express');
const router = express.Router();
const animatronicosController = require('../controllers/animatronicos.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { upload, handleMulterError } = require('../middleware/upload.middleware');
const { crearAnimatronicosValidator } = require('../validators/animatronicos.validator');
const validate = require('../middleware/validation.middleware');

// Configurar multer para aceptar foto y planos
const uploadFields = upload.fields([
  { name: 'foto', maxCount: 1 },
  { name: 'planos', maxCount: 1 }
]);

// Rutas
router.get('/', authMiddleware, animatronicosController.getAll);
router.get('/:id', authMiddleware, animatronicosController.getById);
router.post('/', 
  authMiddleware, 
  uploadFields, 
  handleMulterError,
  crearAnimatronicosValidator, 
  validate, 
  animatronicosController.create
);
router.put('/:id', 
  authMiddleware, 
  uploadFields, 
  handleMulterError,
  animatronicosController.update
);
router.delete('/:id', authMiddleware, animatronicosController.delete);

module.exports = router;