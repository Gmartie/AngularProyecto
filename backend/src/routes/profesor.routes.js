const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const { checkRole } = require('../middleware/permission.middleware');
const pool = require('../config/database');
const ResponseUtil = require('../utils/response.util');
const bcrypt = require('bcryptjs');

// GET: Obtener todos los profesores (Administrador, Tutor, Profesor y Jefe Departamento)
router.get('/', authMiddleware, checkRole('Administrador', 'Tutor', 'Profesor', 'Jefe Departamento'), async (req, res) => {
  try {
    console.log('\n🔍 === GET /api/profesores ===');
    console.log('   Usuario:', req.user.usuario);
    console.log('   ID Usuario:', req.user.id);
    console.log('   Roles:', req.user.roles);
    
    const [profesores] = await pool.query('SELECT id, usuario_id, nombre, email, cargo FROM profesores ORDER BY id');
    console.log(`   ✅ Encontrados ${profesores.length} profesor(es):`);
    profesores.forEach(p => {
      console.log(`      • ${p.nombre} (id: ${p.id}, usuario_id: ${p.usuario_id})`);
    });
    console.log('🔍 ========================\n');
    
    return ResponseUtil.success(res, profesores, 'Profesores obtenidos exitosamente');
  } catch (error) {
    console.error('❌ Error en GET /profesores:', error.message);
    return ResponseUtil.error(res, error.message, error.statusCode || 500);
  }
});

// GET: Obtener profesor por ID (Administrador, Profesor y Jefe Departamento)
router.get('/:id', authMiddleware, checkRole('Administrador', 'Profesor', 'Jefe Departamento'), async (req, res) => {
  try {
    const { id } = req.params;
    const [profesores] = await pool.query('SELECT * FROM profesores WHERE id = ?', [id]);
    
    if (profesores.length === 0) {
      return ResponseUtil.error(res, 'Profesor no encontrado', 404);
    }
    
    return ResponseUtil.success(res, profesores[0], 'Profesor obtenido exitosamente');
  } catch (error) {
    return ResponseUtil.error(res, error.message, error.statusCode || 500);
  }
});

// POST: Crear nuevo profesor (Administrador y Jefe Departamento)
router.post('/', authMiddleware, checkRole('Administrador', 'Jefe Departamento'), async (req, res) => {
  try {
    const { nombre, email, titulacion, cargo } = req.body;

    console.log('📝 Intentando crear profesor:', { nombre, email, cargo });

    // Validación básica
    if (!nombre || !email) {
      return ResponseUtil.error(res, 'El nombre y email son requeridos', 400);
    }

    // Verificar si el email ya existe en profesores
    const [existente] = await pool.query('SELECT id FROM profesores WHERE email = ?', [email]);
    if (existente.length > 0) {
      console.log(`⚠️  Email ${email} ya existe en profesores`);
      return ResponseUtil.error(res, 'El email ya está registrado como profesor', 409);
    }

    // Verificar si el usuario ya existe
    const [usuarioExistente] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (usuarioExistente.length > 0) {
      console.log(`⚠️  Email ${email} ya existe en usuarios`);
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

    // Determinar el rol basado en el cargo
    let nombreRol = 'Profesor'; // rol por defecto
    if (cargo && (cargo.toLowerCase().includes('jefe') || cargo.toLowerCase().includes('departamento'))) {
      nombreRol = 'Jefe Departamento';
      console.log(`📌 Cargo "${cargo}" detectado como Jefe Departamento`);
    }

    // Asignar rol al usuario
    const [rol] = await pool.query('SELECT id FROM roles WHERE nombre = ?', [nombreRol]);
    
    if (rol.length > 0) {
      await pool.query(
        'INSERT INTO usuarios_roles (usuario_id, rol_id) VALUES (?, ?)',
        [usuarioId, rol[0].id]
      );
      console.log(`✅ Rol "${nombreRol}" asignado al usuario ${usuarioFinal}`);
    }

    // Insertar nuevo profesor con usuario_id
    const [result] = await pool.query(
      'INSERT INTO profesores (usuario_id, nombre, email, titulacion, cargo) VALUES (?, ?, ?, ?, ?)',
      [usuarioId, nombre, email, titulacion || null, cargo || null]
    );

    const nuevoProfesor = {
      id: result.insertId,
      usuario_id: usuarioId,
      nombre,
      email,
      titulacion: titulacion || null,
      cargo: cargo || null
    };

    console.log(`✅ Profesor creado exitosamente: ${nombre} (${email}) con usuario_id: ${usuarioId}`);
    return ResponseUtil.success(res, nuevoProfesor, 'Profesor creado exitosamente', 201);
  } catch (error) {
    console.error('❌ Error al crear profesor:', error.message);
    return ResponseUtil.error(res, error.message, error.statusCode || 500);
  }
});

// PUT: Actualizar profesor (Administrador y Jefe Departamento)
router.put('/:id', authMiddleware, checkRole('Administrador', 'Jefe Departamento'), async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, titulacion, cargo } = req.body;

    // Verificar que el profesor existe
    const [profesorExistente] = await pool.query('SELECT * FROM profesores WHERE id = ?', [id]);
    if (profesorExistente.length === 0) {
      return ResponseUtil.error(res, 'Profesor no encontrado', 404);
    }

    // Si se actualiza el email, verificar que no esté en uso
    if (email && email !== profesorExistente[0].email) {
      const [emailEnUso] = await pool.query(
        'SELECT id FROM profesores WHERE email = ? AND id != ?',
        [email, id]
      );
      if (emailEnUso.length > 0) {
        return ResponseUtil.error(res, 'El email ya está en uso', 409);
      }

      // Verificar que el email no esté en tabla usuarios
      const [emailEnUsuarios] = await pool.query(
        'SELECT id FROM usuarios WHERE email = ? AND id != ?',
        [email, profesorExistente[0].usuario_id]
      );
      if (emailEnUsuarios.length > 0) {
        return ResponseUtil.error(res, 'El email ya está registrado en otro usuario', 409);
      }
    }

    // Actualizar profesor
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
    if (titulacion !== undefined) {
      updateFields.push('titulacion = ?');
      updateValues.push(titulacion);
    }
    if (cargo !== undefined) {
      updateFields.push('cargo = ?');
      updateValues.push(cargo);
    }

    if (updateFields.length === 0) {
      return ResponseUtil.error(res, 'No hay datos para actualizar', 400);
    }

    updateValues.push(id);
    
    await pool.query(
      `UPDATE profesores SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Si el profesor tiene usuario asociado y se actualiza el email, actualizar también el usuario
    if (email && email !== profesorExistente[0].email && profesorExistente[0].usuario_id) {
      await pool.query(
        'UPDATE usuarios SET email = ? WHERE id = ?',
        [email, profesorExistente[0].usuario_id]
      );
    }

    // Obtener el profesor actualizado
    const [profesorActualizado] = await pool.query('SELECT * FROM profesores WHERE id = ?', [id]);

    return ResponseUtil.success(res, profesorActualizado[0], 'Profesor actualizado exitosamente');
  } catch (error) {
    return ResponseUtil.error(res, error.message, error.statusCode || 500);
  }
});

// DELETE: Eliminar profesor (Administrador y Jefe Departamento)
router.delete('/:id', authMiddleware, checkRole('Administrador', 'Jefe Departamento'), async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el profesor existe
    const [profesorExistente] = await pool.query('SELECT id FROM profesores WHERE id = ?', [id]);
    if (profesorExistente.length === 0) {
      return ResponseUtil.error(res, 'Profesor no encontrado', 404);
    }

    // Eliminar profesor
    await pool.query('DELETE FROM profesores WHERE id = ?', [id]);

    return ResponseUtil.success(res, { id }, 'Profesor eliminado exitosamente');
  } catch (error) {
    return ResponseUtil.error(res, error.message, error.statusCode || 500);
  }
});

// POST: Crear profesores de prueba
router.post('/crear-prueba', async (req, res) => {
  try {
    const profesores = [
      { nombre: 'Dr. Antonio Silva', titulacion: 'Licenciado en Informática', cargo: 'Jefe de Departamento' },
      { nombre: 'Dra. Isabel Moreno', titulacion: 'Licenciada en Matemáticas', cargo: 'Tutor' },
      { nombre: 'David López Ruiz', titulacion: 'Ingeniero Técnico Informático', cargo: 'Profesor' },
      { nombre: 'Elena Martínez Díaz', titulacion: 'Licenciada en Informática', cargo: 'Profesor' },
      { nombre: 'Francisco Hernández García', titulacion: 'Ingeniero Informático', cargo: 'Tutor' }
    ];

    const creados = [];
    
    for (const profesor of profesores) {
      await pool.query(
        'INSERT INTO profesores (nombre, titulacion, cargo) VALUES (?, ?, ?)',
        [profesor.nombre, profesor.titulacion, profesor.cargo]
      );
      creados.push(profesor);
    }

    return ResponseUtil.success(res, {
      creados: creados.length,
      profesores: creados
    }, `${creados.length} profesores de prueba creados`);
  } catch (error) {
    return ResponseUtil.error(res, error.message, error.statusCode || 500);
  }
});

module.exports = router;