const authService = require('../services/auth.service');
const AuthDTO = require('../dto/auth.dto');
const ResponseUtil = require('../utils/response.util');

class AuthController {
  async login(req, res) {
    try {
      const { usuario, password } = req.body;
      console.log('=== LOGIN REQUEST ===');
      console.log('Usuario:', usuario);
      console.log('Password:', password);
      
      const { user, token, roles } = await authService.login(usuario, password);
      
      console.log('Usuario autenticado:', user);
      console.log('Roles encontrados:', roles);
      
      const response = AuthDTO.toLoginResponse(user, token, roles);
      
      console.log('Respuesta a enviar:', JSON.stringify(response, null, 2));
      console.log('=== FIN LOGIN REQUEST ===');
      
      return ResponseUtil.success(res, response, 'Login exitoso');
    } catch (error) {
      console.log('Error en login:', error.message);
      return ResponseUtil.error(res, error.message, error.statusCode || 500);
    }
  }

  async register(req, res) {
    try {
      console.log('=== REGISTRO REQUEST ===');
      console.log('Body recibido:', req.body);
      
      const usuario = await authService.register(req.body);
      
      console.log('Usuario registrado:', usuario);
      console.log('=== FIN REGISTRO REQUEST ===');
      
      return ResponseUtil.created(res, usuario, 'Usuario registrado exitosamente');
    } catch (error) {
      console.log('Error en registro:', error.message);
      return ResponseUtil.error(res, error.message, error.statusCode || 500);
    }
  }

  async me(req, res) {
    try {
      const pool = require('../config/database');
      const [users] = await pool.query(
        'SELECT * FROM usuario WHERE id = ?',
        [req.user.id]
      );

      if (users.length === 0) {
        return ResponseUtil.error(res, 'Usuario no encontrado', 404);
      }

      const user = users[0];

      // Obtener el rol
      const [roles] = await pool.query(
        'SELECT id, rol FROM roles WHERE id = ?',
        [user.id_rol]
      );

      const rolesArray = roles.length > 0 ? [{ id: roles[0].id, nombre: roles[0].rol }] : [];

      const UsuarioDTO = require('../dto/usuario.dto');
      const response = UsuarioDTO.toDetailResponse(user, rolesArray);
      
      return ResponseUtil.success(res, response);
    } catch (error) {
      return ResponseUtil.error(res, error.message, error.statusCode || 500);
    }
  }
}
 router.get('/debug/roles', authController.debugRoles);
router.get('/create-admin-user', authController.createAdminUser);
router.post('/create-test-user', authController.createTestUser);
router.post('/assign-admin-role', authController.assignAdminRole);

module.exports = new AuthController();