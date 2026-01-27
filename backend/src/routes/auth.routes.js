const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { body } = require('express-validator');
const validate = require('../middleware/validation.middleware');

// Middleware para loguear datos de registro
const logRegisterData = (req, res, next) => {
  console.log('=== REGISTRO REQUEST ===');
  console.log('Headers Content-Type:', req.headers['content-type']);
  console.log('Body recibido:', req.body);
  console.log('Body keys:', Object.keys(req.body));
  console.log('======================');
  next();
};

const loginValidator = [
  body('usuario').notEmpty().withMessage('El usuario es obligatorio'),
  body('password').notEmpty().withMessage('La contrasena es obligatoria')
];

const registerValidator = [
  body('usuario').trim().isLength({ min: 3 }).withMessage('Usuario minimo 3 caracteres'),
  body('email').isEmail().withMessage('Email invalido'),
  body('password').isLength({ min: 6 }).withMessage('Contrasena minimo 6 caracteres')
];

router.post('/login', loginValidator, validate, authController.login);
router.post('/register', logRegisterData, registerValidator, validate, authController.register);
router.get('/me',authMiddleware, authController.me);
router.get('/debug/roles', authController.debugRoles);
router.get('/create-admin-user', authController.createAdminUser);
router.post('/create-test-user', authController.createTestUser);
router.post('/assign-admin-role', authController.assignAdminRole);

module.exports = router;