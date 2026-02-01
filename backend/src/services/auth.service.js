const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { UnauthorizedError, ValidationError } = require('../utils/errors.util');

class AuthService {
  async login(usuario, password) {
    console.log(`🔍 LOGIN: Intentando loguear usuario: ${usuario}`);
    
    // Buscar en la tabla 'usuario' (singular) con campos 'usuario', 'pass', 'correo', 'id_rol'
    const [users] = await pool.query(
      'SELECT * FROM usuario WHERE usuario = ? OR correo = ?',
      [usuario, usuario]
    );

    console.log(`🔍 LOGIN: Usuarios encontrados:`, users);

    if (users.length === 0) {
      console.log(`❌ LOGIN: Usuario no encontrado: ${usuario}`);
      throw new UnauthorizedError('Credenciales invalidas');
    }

    const user = users[0];
    console.log(`✅ LOGIN: Usuario encontrado:`, user.usuario);
    console.log(`🔍 LOGIN: Contraseña ingresada: ${password}`);
    console.log(`🔍 LOGIN: Contraseña en BD: ${user.pass}`);

    // Comparar contraseñas (en texto plano en la BD original)
    const isValidPassword = password === user.pass;
    console.log(`🔍 LOGIN: Validación de contraseña: ${isValidPassword}`);

    if (!isValidPassword) {
      console.log(`❌ LOGIN: Contraseña inválida para usuario: ${usuario}`);
      throw new UnauthorizedError('Credenciales invalidas');
    }

    // Obtener el rol del usuario
    const [roles] = await pool.query(
      'SELECT id, rol FROM roles WHERE id = ?',
      [user.id_rol]
    );

    console.log(`🔍 LOGIN: Rol encontrado:`, roles);

    // El rol como array para mantener compatibilidad con el frontend
    const rolesArray = roles.length > 0 ? [{ id: roles[0].id, nombre: roles[0].rol }] : [];

    const token = jwt.sign(
      { 
        id: user.id, 
        usuario: user.usuario,
        id_rol: user.id_rol,
        roles: rolesArray.map(r => r.nombre)
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    console.log(`✅ LOGIN: Token generado exitosamente`);
    
    return { user, token, roles: rolesArray };
  }

  async register(usuarioData) {
    const { usuario, email, password } = usuarioData;

    // Verificar si ya existe (usando 'correo' como está en la BD)
    const [existing] = await pool.query(
      'SELECT id FROM usuario WHERE usuario = ? OR correo = ?',
      [usuario, email]
    );

    if (existing.length > 0) {
      throw new ValidationError('El usuario o email ya existe');
    }

    // Insertar nuevo usuario con contraseña en texto plano (como está en la BD original)
    // Por defecto asignar rol 3 (Guardia de seguridad / Usuario registrado)
    const [result] = await pool.query(
      'INSERT INTO usuario (usuario, pass, correo, id_rol) VALUES (?, ?, ?, ?)',
      [usuario, password, email, 3]
    );

    const userId = result.insertId;

    // Obtener el usuario recién creado
    const [newUser] = await pool.query('SELECT * FROM usuario WHERE id = ?', [userId]);
    
    return newUser[0];
  }
}

module.exports = new AuthService();