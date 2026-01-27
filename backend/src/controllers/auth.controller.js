const authService = require('../services/auth.service');
const AuthDTO = require('../dto/auth.dto');
const ResponseUtil = require('../utils/response.util');

class AuthController {
  async login(req, res) {
    try {
      const { usuario, password } = req.body;
      console.log('=== LOGIN REQUEST ===');
      console.log('Usuario:', usuario);
      
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
      const usuario = await authService.register(req.body);
      return ResponseUtil.created(res, usuario, 'Usuario registrado exitosamente');
    } catch (error) {
      return ResponseUtil.error(res, error.message, error.statusCode || 500);
    }
  }

  async me(req, res) {
    try {
      const pool = require('../config/database');
      const [users] = await pool.query(
        'SELECT * FROM usuarios WHERE id = ?',
        [req.user.id]
      );

      const queryRoles = `
        SELECT r.id, r.nombre 
        FROM roles r
        INNER JOIN usuarios_roles ur ON r.id = ur.rol_id
        WHERE ur.usuario_id = ?
      `;

      const [roles] = await pool.query(queryRoles, [req.user.id]);

      const UsuarioDTO = require('../dto/usuario.dto');
      const response = UsuarioDTO.toDetailResponse(users[0], roles);
      
      return ResponseUtil.success(res, response);
    } catch (error) {
      return ResponseUtil.error(res, error.message, error.statusCode || 500);
    }
  }

  async debugRoles(req, res) {
    try {
      const pool = require('../config/database');
      
      // Obtener todos los usuarios con sus roles
      const [usuarios] = await pool.query(`
        SELECT u.id, u.usuario, u.email, 
               GROUP_CONCAT(r.nombre SEPARATOR ', ') as roles
        FROM usuarios u
        LEFT JOIN usuarios_roles ur ON u.id = ur.usuario_id
        LEFT JOIN roles r ON ur.rol_id = r.id
        GROUP BY u.id, u.usuario, u.email
      `);

      console.log('DEBUG: Todos los usuarios y sus roles:');
      console.log(JSON.stringify(usuarios, null, 2));

      return ResponseUtil.success(res, {
        usuarios,
        timestamp: new Date().toISOString()
      }, 'Debug de usuarios y roles');
    } catch (error) {
      return ResponseUtil.error(res, error.message, error.statusCode || 500);
    }
  }

  async assignAdminRole(req, res) {
    try {
      const { usuario } = req.body;
      const pool = require('../config/database');

      console.log(`🔍 Buscando usuario: ${usuario}`);

      // Obtener el ID del usuario
      const [users] = await pool.query('SELECT id FROM usuarios WHERE usuario = ?', [usuario]);
      if (!users || users.length === 0) {
        console.error(`❌ Usuario no encontrado: ${usuario}`);
        
        // Listar todos los usuarios para debug
        const [allUsers] = await pool.query('SELECT id, usuario FROM usuarios');
        console.log('Usuarios en BD:', allUsers);
        
        return ResponseUtil.error(res, `Usuario "${usuario}" no encontrado en BD`, 404);
      }

      const userId = users[0].id;
      console.log(`✅ Usuario encontrado: ${usuario} (ID: ${userId})`);

      // Obtener el ID del rol Administrador
      const [roles] = await pool.query('SELECT id FROM roles WHERE nombre = ?', ['Administrador']);
      if (!roles || roles.length === 0) {
        console.error('❌ Rol Administrador no encontrado');
        return ResponseUtil.error(res, 'Rol Administrador no existe', 404);
      }

      const roleId = roles[0].id;
      console.log(`✅ Rol encontrado: Administrador (ID: ${roleId})`);

      // Insertar la relación si no existe
      await pool.query(
        'INSERT IGNORE INTO usuarios_roles (usuario_id, rol_id) VALUES (?, ?)',
        [userId, roleId]
      );

      console.log(`✅ Rol Administrador asignado a usuario: ${usuario}`);

      return ResponseUtil.success(res, {
        usuario,
        rol: 'Administrador',
        message: 'Rol asignado correctamente'
      }, 'Rol Administrador asignado');
    } catch (error) {
      console.error('❌ Error en assignAdminRole:', error);
      return ResponseUtil.error(res, error.message, error.statusCode || 500);
    }
  }

  async createAdminUser(req, res) {
    try {
      const bcryptjs = require('bcryptjs');
      const pool = require('../config/database');

      // Generar el hash correcto de la contraseña "admin123"
      const hashedPassword = await bcryptjs.hash('admin123', 10);
      console.log('Hash generado para admin123:', hashedPassword);

      // Insertar o actualizar el usuario admin
      await pool.query(
        `INSERT INTO usuarios (usuario, email, password, activo, fecha_registro) 
         VALUES ('admin', 'admin@example.com', ?, 1, NOW())
         ON DUPLICATE KEY UPDATE 
           email = 'admin@example.com',
           password = ?,
           activo = 1`,
        [hashedPassword, hashedPassword]
      );

      console.log('✅ Usuario admin creado en BD');

      // Obtener el ID del usuario admin
      const [users] = await pool.query('SELECT id FROM usuarios WHERE usuario = ?', ['admin']);
      if (!users || users.length === 0) {
        console.error('❌ Error: Usuario admin no encontrado después de insertar');
        return ResponseUtil.error(res, 'Usuario admin no se pudo crear', 500);
      }

      const adminId = users[0].id;
      console.log('✅ Admin ID obtenido:', adminId);

      // Obtener el ID del rol Administrador
      const [roles] = await pool.query('SELECT id FROM roles WHERE nombre = ?', ['Administrador']);
      if (!roles || roles.length === 0) {
        console.error('❌ Error: Rol Administrador no encontrado en BD');
        return ResponseUtil.error(res, 'Rol Administrador no existe en BD', 500);
      }

      const adminRoleId = roles[0].id;
      console.log('✅ Admin Role ID obtenido:', adminRoleId);

      // Asignar el rol Administrador
      const result = await pool.query(
        'INSERT IGNORE INTO usuarios_roles (usuario_id, rol_id) VALUES (?, ?)',
        [adminId, adminRoleId]
      );
      console.log('✅ Rol Administrador asignado. Result:', result);

      console.log('✅ Usuario admin creado/actualizado con rol Administrador');

      return ResponseUtil.success(res, {
        usuario: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
        rol: 'Administrador',
        message: 'Usuario admin creado/actualizado correctamente'
      }, 'Usuario admin creado');
    } catch (error) {
      console.error('❌ Error en createAdminUser:', error);
      return ResponseUtil.error(res, error.message, error.statusCode || 500);
    }
  }

  async createTestUser(req, res) {
    try {
      const bcryptjs = require('bcryptjs');
      const pool = require('../config/database');
      
      const { usuario, email, password, rol } = req.body;

      // Validar entrada
      if (!usuario || !email || !password || !rol) {
        return ResponseUtil.error(res, 'Se requieren usuario, email, password y rol', 400);
      }

      console.log(`🔨 Creando usuario de prueba: ${usuario} con rol ${rol}`);

      // Generar hash de contraseña
      const hashedPassword = await bcryptjs.hash(password, 10);

      // Insertar o actualizar el usuario
      await pool.query(
        `INSERT INTO usuarios (usuario, email, password, activo, fecha_registro) 
         VALUES (?, ?, ?, 1, NOW())
         ON DUPLICATE KEY UPDATE 
           email = ?,
           password = ?,
           activo = 1`,
        [usuario, email, hashedPassword, email, hashedPassword]
      );

      console.log(`✅ Usuario ${usuario} creado en BD`);

      // Obtener el ID del usuario
      const [users] = await pool.query('SELECT id FROM usuarios WHERE usuario = ?', [usuario]);
      if (!users || users.length === 0) {
        return ResponseUtil.error(res, 'Usuario no se pudo crear', 500);
      }

      const userId = users[0].id;

      // Obtener el ID del rol especificado
      const [roles] = await pool.query('SELECT id FROM roles WHERE nombre = ?', [rol]);
      if (!roles || roles.length === 0) {
        return ResponseUtil.error(res, `Rol "${rol}" no existe en BD`, 404);
      }

      const roleId = roles[0].id;

      // Asignar el rol
      await pool.query(
        'INSERT IGNORE INTO usuarios_roles (usuario_id, rol_id) VALUES (?, ?)',
        [userId, roleId]
      );

      console.log(`✅ Rol ${rol} asignado a usuario ${usuario}`);

      return ResponseUtil.success(res, {
        usuario,
        email,
        password, // Se devuelve la contraseña en texto plano SOLO para testing
        rol,
        message: `Usuario ${usuario} creado con rol ${rol}`
      }, `Usuario ${usuario} creado correctamente`);
    } catch (error) {
      console.error('❌ Error en createTestUser:', error);
      return ResponseUtil.error(res, error.message, error.statusCode || 500);
    }
  }
}

module.exports = new AuthController();