const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const pool = require('../config/database');
const ResponseUtil = require('../utils/response.util');
const bcrypt = require('bcryptjs');

// GET: Obtener todos los alumnos
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [alumnos] = await pool.query('SELECT * FROM alumnos ORDER BY id');
    return ResponseUtil.success(res, alumnos, 'Alumnos obtenidos exitosamente');
  } catch (error) {
    return ResponseUtil.error(res, error.message, error.statusCode || 500);
  }
});

// GET: Obtener alumno por ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const [alumnos] = await pool.query('SELECT * FROM alumnos WHERE id = ?', [id]);
    
    if (alumnos.length === 0) {
      return ResponseUtil.error(res, 'Alumno no encontrado', 404);
    }
    
    return ResponseUtil.success(res, alumnos[0], 'Alumno obtenido exitosamente');
  } catch (error) {
    return ResponseUtil.error(res, error.message, error.statusCode || 500);
  }
});

// POST: Crear nuevo alumno
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { nombre, email, movil } = req.body;

    // Validación básica
    if (!nombre || !email) {
      return ResponseUtil.error(res, 'El nombre y email son requeridos', 400);
    }

    // Verificar si el email ya existe
    const [existente] = await pool.query('SELECT id FROM alumnos WHERE email = ?', [email]);
    if (existente.length > 0) {
      return ResponseUtil.error(res, 'El email ya está registrado', 409);
    }

    // Verificar si el usuario ya existe
    const [usuarioExistente] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (usuarioExistente.length > 0) {
      return ResponseUtil.error(res, 'El email ya tiene una cuenta de usuario asociada', 409);
    }

    // Extraer password del email (texto antes del @)
    const passwordDelEmail = email.split('@')[0];

    // Generar hash de la contraseña
    const hashedPassword = await bcrypt.hash(passwordDelEmail, 10);

    // Generar nombre de usuario automático a partir del nombre
    let nombreUsuario = nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .replace(/\s+/g, '.')
      .replace(/[^a-z0-9.]/g, '');

    // Asegurar unicidad del nombre de usuario
    let usuarioFinal = nombreUsuario;
    let contador = 1;
    const [usuarioConMismoNombre] = await pool.query(
      'SELECT id FROM usuarios WHERE usuario LIKE ?',
      [`${nombreUsuario}%`]
    );
    if (usuarioConMismoNombre.length > 0) {
      usuarioFinal = `${nombreUsuario}${contador}`;
    }

    // Crear usuario en tabla usuarios
    const [resultUsuario] = await pool.query(
      'INSERT INTO usuarios (usuario, email, password, activo, fecha_registro) VALUES (?, ?, ?, ?, NOW())',
      [usuarioFinal, email, hashedPassword, true]
    );

    const usuarioId = resultUsuario.insertId;

    // Asignar rol "Alumno" al usuario
    const [rol] = await pool.query('SELECT id FROM roles WHERE nombre = ?', ['Alumno']);
    
    if (rol.length > 0) {
      await pool.query(
        'INSERT INTO usuarios_roles (usuario_id, rol_id) VALUES (?, ?)',
        [usuarioId, rol[0].id]
      );
    }

    // Insertar nuevo alumno
    const [result] = await pool.query(
      'INSERT INTO alumnos (usuario_id, nombre, email, movil) VALUES (?, ?, ?, ?)',
      [usuarioId, nombre, email, movil || null]
    );

    const nuevoAlumno = {
      id: result.insertId,
      usuario_id: usuarioId,
      nombre,
      email,
      movil: movil || null
    };

    return ResponseUtil.success(res, nuevoAlumno, 'Alumno creado exitosamente', 201);
  } catch (error) {
    return ResponseUtil.error(res, error.message, error.statusCode || 500);
  }
});

// POST: Crear alumno CON usuario para que pueda iniciar sesión
router.post('/con-usuario', authMiddleware, async (req, res) => {
  try {
    const { nombre, email, movil, password } = req.body;

    console.log('=== CREAR ALUMNO CON USUARIO ===');
    console.log('Datos recibidos:', { nombre, email, movil, password });
    console.log('Tipo de password:', typeof password);
    console.log('Longitud de password:', password?.length);
    console.log('====================================');

    // Validación de campos requeridos
    if (!nombre || !email || !password) {
      return ResponseUtil.error(res, 'Nombre, email y contraseña son requeridos', 400);
    }

    if (password.length < 6) {
      return ResponseUtil.error(res, 'La contraseña debe tener al menos 6 caracteres', 400);
    }

    // Verificar si el email del alumno ya existe
    const [alumnoExistente] = await pool.query('SELECT id FROM alumnos WHERE email = ?', [email]);
    if (alumnoExistente.length > 0) {
      return ResponseUtil.error(res, 'El email del alumno ya está registrado', 409);
    }

    // Verificar si el usuario ya existe
    const [usuarioExistente] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (usuarioExistente.length > 0) {
      return ResponseUtil.error(res, 'El email ya tiene una cuenta de usuario asociada', 409);
    }

    // Generar hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generar nombre de usuario automático a partir del nombre
    // Convertir "Juan García" a "juan.garcia"
    let nombreUsuario = nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .replace(/\s+/g, '.')
      .replace(/[^a-z0-9.]/g, '');

    // Asegurar unicidad del nombre de usuario
    let usuarioFinal = nombreUsuario;
    let contador = 1;
    const [usuarioConMismoNombre] = await pool.query(
      'SELECT id FROM usuarios WHERE usuario LIKE ?',
      [`${nombreUsuario}%`]
    );
    if (usuarioConMismoNombre.length > 0) {
      usuarioFinal = `${nombreUsuario}${contador}`;
    }

    // ================================================================
    // PASO 1: Crear usuario en tabla usuarios
    // ================================================================
    const usuarioParaCrear = {
      usuario: usuarioFinal,
      email: email,
      password: hashedPassword,
      activo: true
    };

    const [resultUsuario] = await pool.query(
      'INSERT INTO usuarios (usuario, email, password, activo, fecha_registro) VALUES (?, ?, ?, ?, NOW())',
      [usuarioParaCrear.usuario, usuarioParaCrear.email, usuarioParaCrear.password, usuarioParaCrear.activo]
    );

    const usuarioId = resultUsuario.insertId;
    console.log(`✅ Usuario creado con ID: ${usuarioId} para email: ${email}`);

    // ================================================================
    // PASO 2: Asignar rol "Alumno" al usuario
    // ================================================================
    const [rol] = await pool.query('SELECT id FROM roles WHERE nombre = ?', ['Alumno']);
    
    if (rol.length > 0) {
      await pool.query(
        'INSERT INTO usuarios_roles (usuario_id, rol_id) VALUES (?, ?)',
        [usuarioId, rol[0].id]
      );
      console.log(`✅ Rol "Alumno" asignado al usuario ID: ${usuarioId}`);
    } else {
      console.log('⚠️ Rol "Alumno" no encontrado en la BD');
    }

    // ================================================================
    // PASO 3: Crear alumno en tabla alumnos
    // ================================================================
    const [resultAlumno] = await pool.query(
      'INSERT INTO alumnos (usuario_id, nombre, email, movil) VALUES (?, ?, ?, ?)',
      [usuarioId, nombre, email, movil || null]
    );

    const nuevoAlumno = {
      id: resultAlumno.insertId,
      usuario_id: usuarioId,
      nombre,
      email,
      movil: movil || null
    };

    console.log(`✅ Alumno creado con ID: ${nuevoAlumno.id}`);

    return ResponseUtil.success(
      res,
      {
        alumno: nuevoAlumno,
        usuario: {
          id: usuarioId,
          usuario: usuarioParaCrear.usuario,
          email: usuarioParaCrear.email
        }
      },
      'Alumno y usuario creados exitosamente. El alumno puede ahora iniciar sesión.',
      201
    );
  } catch (error) {
    console.error('❌ Error al crear alumno con usuario:', error);
    return ResponseUtil.error(res, error.message, error.statusCode || 500);
  }
});
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, movil } = req.body;

    // Verificar que el alumno existe
    const [alumnoExistente] = await pool.query('SELECT * FROM alumnos WHERE id = ?', [id]);
    if (alumnoExistente.length === 0) {
      return ResponseUtil.error(res, 'Alumno no encontrado', 404);
    }

    // Si se actualiza el email, verificar que no esté en uso
    if (email && email !== alumnoExistente[0].email) {
      const [emailEnUso] = await pool.query(
        'SELECT id FROM alumnos WHERE email = ? AND id != ?',
        [email, id]
      );
      if (emailEnUso.length > 0) {
        return ResponseUtil.error(res, 'El email ya está en uso', 409);
      }

      // Verificar que el email no esté en tabla usuarios
      const [emailEnUsuarios] = await pool.query(
        'SELECT id FROM usuarios WHERE email = ? AND id != ?',
        [email, alumnoExistente[0].usuario_id]
      );
      if (emailEnUsuarios.length > 0) {
        return ResponseUtil.error(res, 'El email ya está registrado en otro usuario', 409);
      }
    }

    // Actualizar alumno
    const updateFields = [];
    const updateValues = [];

    if (nombre !== undefined) {
      updateFields.push('nombre = ?');
      updateValues.push(nombre);
    }
    if (email !== undefined) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    if (movil !== undefined) {
      updateFields.push('movil = ?');
      updateValues.push(movil);
    }

    if (updateFields.length === 0) {
      return ResponseUtil.error(res, 'No hay datos para actualizar', 400);
    }

    updateValues.push(id);
    
    await pool.query(
      `UPDATE alumnos SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Si el alumno tiene usuario asociado y se actualiza el email, actualizar también el usuario
    if (email && email !== alumnoExistente[0].email && alumnoExistente[0].usuario_id) {
      await pool.query(
        'UPDATE usuarios SET email = ? WHERE id = ?',
        [email, alumnoExistente[0].usuario_id]
      );
    }

    // Obtener el alumno actualizado
    const [alumnoActualizado] = await pool.query('SELECT * FROM alumnos WHERE id = ?', [id]);

    return ResponseUtil.success(res, alumnoActualizado[0], 'Alumno actualizado exitosamente');
  } catch (error) {
    return ResponseUtil.error(res, error.message, error.statusCode || 500);
  }
});

// DELETE: Eliminar alumno
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el alumno existe
    const [alumnoExistente] = await pool.query('SELECT id FROM alumnos WHERE id = ?', [id]);
    if (alumnoExistente.length === 0) {
      return ResponseUtil.error(res, 'Alumno no encontrado', 404);
    }

    // Eliminar alumno
    await pool.query('DELETE FROM alumnos WHERE id = ?', [id]);

    return ResponseUtil.success(res, { id }, 'Alumno eliminado exitosamente');
  } catch (error) {
    return ResponseUtil.error(res, error.message, error.statusCode || 500);
  }
});

// Endpoint para crear alumnos de prueba
router.post('/crear-prueba', async (req, res) => {
  try {
    const alumnos = [
      { nombre: 'Juan García López', email: 'juan@example.com', movil: '612345678' },
      { nombre: 'María Rodríguez García', email: 'maria@example.com', movil: '623456789' },
      { nombre: 'Carlos Martínez Ruiz', email: 'carlos@example.com', movil: '634567890' },
      { nombre: 'Ana Fernández López', email: 'ana@example.com', movil: '645678901' },
      { nombre: 'Pedro González Pérez', email: 'pedro@example.com', movil: '656789012' }
    ];

    const creados = [];
    
    for (const alumno of alumnos) {
      await pool.query(
        'INSERT INTO alumnos (nombre, email, movil) VALUES (?, ?, ?)',
        [alumno.nombre, alumno.email, alumno.movil]
      );
      creados.push(alumno);
    }

    return ResponseUtil.success(res, {
      creados: creados.length,
      alumnos: creados
    }, `${creados.length} alumnos de prueba creados`);
  } catch (error) {
    return ResponseUtil.error(res, error.message, error.statusCode || 500);
  }
});

module.exports = router;