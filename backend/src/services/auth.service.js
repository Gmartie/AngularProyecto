const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { UnauthorizedError, ValidationError } = require('../utils/errors.util');

class AuthService {
  async login(usuario, password) {
    console.log(`🔍 LOGIN: Intentando loguear usuario: ${usuario}`);
    
    const [users] = await pool.query(
      'SELECT * FROM usuarios WHERE (usuario = ? OR email = ?) AND activo = TRUE',
      [usuario, usuario]
    );

    console.log(`🔍 LOGIN: Usuarios encontrados:`, users);

    if (users.length === 0) {
      console.log(`❌ LOGIN: Usuario no encontrado o inactivo: ${usuario}`);
      throw new UnauthorizedError('Credenciales invalidas');
    }

    const user = users[0];
    console.log(`✅ LOGIN: Usuario encontrado:`, user.usuario);
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log(`🔍 LOGIN: Validación de contraseña: ${isValidPassword}`);
    console.log(`🔍 LOGIN: Contraseña ingresada: ${password}`);
    console.log(`🔍 LOGIN: Hash en BD: ${user.password}`);

    if (!isValidPassword) {
      console.log(`❌ LOGIN: Contraseña inválida para usuario: ${usuario}`);
      throw new UnauthorizedError('Credenciales invalidas');
    }

    const queryRoles = `
      SELECT r.id, r.nombre 
      FROM roles r
      INNER JOIN usuarios_roles ur ON r.id = ur.rol_id
      WHERE ur.usuario_id = ?
    `;

    const [roles] = await pool.query(queryRoles, [user.id]);
    console.log(`🔍 LOGIN: Roles encontrados:`, roles);

    const token = jwt.sign(
      { 
        id: user.id, 
        usuario: user.usuario,
        roles: roles.map(r => r.nombre)
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    console.log(`✅ LOGIN: Token generado exitosamente`);
    return { user, token, roles };
  }

  async register(usuarioData, rolNombre = 'Usuario Registrado') {
    const { usuario, email, password } = usuarioData;

    const [existing] = await pool.query(
      'SELECT id FROM usuarios WHERE usuario = ? OR email = ?',
      [usuario, email]
    );

    if (existing.length > 0) {
      throw new ValidationError('El usuario o email ya existe');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO usuarios (usuario, email, password) VALUES (?, ?, ?)',
      [usuario, email, hashedPassword]
    );

    const userId = result.insertId;

    const [rol] = await pool.query('SELECT id FROM roles WHERE nombre = ?', [rolNombre]);
    
    if (rol.length > 0) {
      await pool.query(
        'INSERT INTO usuarios_roles (usuario_id, rol_id) VALUES (?, ?)',
        [userId, rol[0].id]
      );
    }

    const [newUser] = await pool.query('SELECT * FROM usuarios WHERE id = ?', [userId]);
    
    return newUser[0];
  }
}

module.exports = new AuthService();