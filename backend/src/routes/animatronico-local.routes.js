const express = require('express');
const router = express.Router();
const animatronicoLocalController = require('../controllers/animatronico-local.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Rutas
router.get('/', authMiddleware, animatronicoLocalController.getAll);
router.get('/local/:id_local', authMiddleware, animatronicoLocalController.getByLocal);
router.post('/', authMiddleware, animatronicoLocalController.asignar);
router.patch('/:id_animatronico/:id_local', authMiddleware, animatronicoLocalController.actualizarEstado);
router.delete('/:id_animatronico/:id_local', authMiddleware, animatronicoLocalController.remover);

module.exports = router;
