const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const pool = require('../config/database');
const ResponseUtil = require('../utils/response.util');

// Obtener todas las matrículas
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [matriculas] = await pool.query(`
      SELECT m.*, a.nombre as alumno_nombre, mo.nombre as modulo_nombre 
      FROM matriculas m
      JOIN alumnos a ON m.alumno_id = a.id
      JOIN modulos mo ON m.modulo_id = mo.id
      ORDER BY m.id
    `);
    return ResponseUtil.success(res, matriculas, 'Matrículas obtenidas exitosamente');
  } catch (error) {
    return ResponseUtil.error(res, error.message, error.statusCode || 500);
  }
});

// Obtener matrículas de un alumno específico
router.get('/alumno/:alumnoId', authMiddleware, async (req, res) => {
  try {
    const { alumnoId } = req.params;
    const [matriculas] = await pool.query(`
      SELECT m.*, mo.nombre as modulo_nombre, mo.codigo, mo.horasSemanales, mo.curso
      FROM matriculas m
      JOIN modulos mo ON m.modulo_id = mo.id
      WHERE m.alumno_id = ?
      ORDER BY m.id
    `, [alumnoId]);
    return ResponseUtil.success(res, matriculas, 'Matrículas del alumno obtenidas');
  } catch (error) {
    return ResponseUtil.error(res, error.message, error.statusCode || 500);
  }
});

// Obtener matrículas del usuario autenticado
router.get('/mi-cuenta/matriculas', authMiddleware, async (req, res) => {
  try {
    // El usuario actual viene en req.user desde el authMiddleware
    const usuarioId = req.user.id;

    // Primero obtener el alumno asociado al usuario
    const [alumnos] = await pool.query(
      'SELECT id FROM alumnos WHERE usuario_id = ?',
      [usuarioId]
    );

    if (alumnos.length === 0) {
      return ResponseUtil.success(res, [], 'El usuario no tiene un registro de alumno');
    }

    const alumnoId = alumnos[0].id;

    // Obtener matrículas del alumno
    const [matriculas] = await pool.query(`
      SELECT 
        m.id,
        m.alumno_id,
        m.modulo_id,
        m.fecha_matricula,
        m.estado,
        mo.nombre as modulo_nombre,
        mo.codigo,
        mo.horas_semanales as horasSemanales,
        mo.curso
      FROM matriculas m
      JOIN modulos mo ON m.modulo_id = mo.id
      WHERE m.alumno_id = ? AND m.estado = 'Activa'
      ORDER BY mo.nombre
    `, [alumnoId]);

    return ResponseUtil.success(res, matriculas, 'Matrículas obtenidas exitosamente');
  } catch (error) {
    return ResponseUtil.error(res, error.message, error.statusCode || 500);
  }
});

// Crear una matrícula
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { alumno_id, modulo_id } = req.body;

    if (!alumno_id || !modulo_id) {
      return ResponseUtil.error(res, 'alumno_id y modulo_id son requeridos', 400);
    }

    // Verificar que el alumno existe
    const [alumno] = await pool.query('SELECT id FROM alumnos WHERE id = ?', [alumno_id]);
    if (alumno.length === 0) {
      return ResponseUtil.error(res, 'El alumno no existe', 404);
    }

    // Verificar que el módulo existe
    const [modulo] = await pool.query('SELECT id FROM modulos WHERE id = ?', [modulo_id]);
    if (modulo.length === 0) {
      return ResponseUtil.error(res, 'El módulo no existe', 404);
    }

    // Verificar que no existe matrícula duplicada
    const [existe] = await pool.query(
      'SELECT id FROM matriculas WHERE alumno_id = ? AND modulo_id = ?',
      [alumno_id, modulo_id]
    );
    if (existe.length > 0) {
      return ResponseUtil.error(res, 'El alumno ya está matriculado en este módulo', 409);
    }

    await pool.query(
      'INSERT INTO matriculas (alumno_id, modulo_id) VALUES (?, ?)',
      [alumno_id, modulo_id]
    );

    return ResponseUtil.success(res, { alumno_id, modulo_id }, 'Matrícula creada exitosamente');
  } catch (error) {
    return ResponseUtil.error(res, error.message, error.statusCode || 500);
  }
});

// Eliminar una matrícula
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query('DELETE FROM matriculas WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return ResponseUtil.error(res, 'La matrícula no existe', 404);
    }

    return ResponseUtil.success(res, { id }, 'Matrícula eliminada exitosamente');
  } catch (error) {
    return ResponseUtil.error(res, error.message, error.statusCode || 500);
  }
});

// Crear matrículas de prueba
router.post('/crear-prueba', async (req, res) => {
  try {
    // Obtener alumnos y módulos para crear matrículas
    const [alumnos] = await pool.query('SELECT id FROM alumnos LIMIT 5');
    const [modulos] = await pool.query('SELECT id FROM modulos LIMIT 5');

    if (alumnos.length === 0 || modulos.length === 0) {
      return ResponseUtil.error(res, 'No hay alumnos o módulos disponibles', 400);
    }

    const creadas = [];
    let contador = 0;

    // Crear matrículas
    for (let i = 0; i < alumnos.length; i++) {
      for (let j = 0; j < Math.min(2, modulos.length); j++) {
        const alumnoId = alumnos[i].id;
        const moduloId = modulos[j].id;

        // Verificar que no existe matrícula duplicada
        const [existe] = await pool.query(
          'SELECT id FROM matriculas WHERE alumno_id = ? AND modulo_id = ?',
          [alumnoId, moduloId]
        );

        if (existe.length === 0) {
          await pool.query(
            'INSERT INTO matriculas (alumno_id, modulo_id) VALUES (?, ?)',
            [alumnoId, moduloId]
          );
          creadas.push({ alumno_id: alumnoId, modulo_id: moduloId });
          contador++;
        }
      }
    }

    return ResponseUtil.success(res, {
      creadas: contador,
      matriculas: creadas
    }, `${contador} matrículas de prueba creadas`);
  } catch (error) {
    return ResponseUtil.error(res, error.message, error.statusCode || 500);
  }
});

module.exports = router;
