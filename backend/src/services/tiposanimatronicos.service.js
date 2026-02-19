const pool = require('../config/database');
const { NotFoundError } = require('../utils/errors.util');
const path = require('path');
const fs = require('fs');

class TiposAnimatronicosService {

  /**
   * Devuelve tipos de animatrónicos.
   * - Admin: todos los tipos.
   * - Normal: solo los tipos que tienen al menos un animatrónico
   *   asignado a ese local
   */
  async getAll(idLocal = null) {
    if (idLocal) {
      const query = `
        SELECT DISTINCT ta.*
        FROM tipos_animatronicos ta
        INNER JOIN animatronicos a        ON a.id_gama          = ta.id
        INNER JOIN animatronico_local al  ON al.id_animatronico = a.id
        WHERE al.id_local = ?
        ORDER BY ta.nombre
      `;
      const [rows] = await pool.query(query, [idLocal]);
      return rows;
    }

    const [rows] = await pool.query('SELECT * FROM tipos_animatronicos ORDER BY nombre');
    return rows;
  }

  async getById(id) {
    const [rows] = await pool.query('SELECT * FROM tipos_animatronicos WHERE id = ?', [id]);
    if (!rows.length) throw new NotFoundError('Tipo no encontrado');
    return rows[0];
  }

  async create(data) {
    const { nombre, icono } = data;
    const [result] = await pool.query(
      'INSERT INTO tipos_animatronicos (nombre, icono) VALUES (?, ?)',
      [nombre, icono || null]
    );
    return this.getById(result.insertId);
  }

  async update(id, data) {
    const tipoActual = await this.getById(id);
    const updates = [];
    const values  = [];

    if (data.nombre !== undefined) {
      updates.push('nombre = ?');
      values.push(data.nombre);
    }

    if (data.icono !== undefined) {
      // Eliminar icono personalizado anterior si existe
      if (tipoActual.icono && tipoActual.icono.startsWith('/Icons/tipos/')) {
        const rutaArchivo = path.join(
          __dirname, '../../../frontend/public', tipoActual.icono
        );
        try {
          if (fs.existsSync(rutaArchivo)) fs.unlinkSync(rutaArchivo);
        } catch (err) {
          console.error('Error eliminando icono anterior:', err.message);
        }
      }
      updates.push('icono = ?');
      values.push(data.icono);
    }

    if (updates.length) {
      values.push(id);
      await pool.query(
        `UPDATE tipos_animatronicos SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    }

    return this.getById(id);
  }

  async delete(id) {
    const tipo = await this.getById(id);

    if (tipo.icono && tipo.icono.startsWith('/Icons/tipos/')) {
      const rutaArchivo = path.join(
        __dirname, '../../../frontend/public', tipo.icono
      );
      try {
        if (fs.existsSync(rutaArchivo)) fs.unlinkSync(rutaArchivo);
      } catch (err) {
        console.error('Error eliminando icono:', err.message);
      }
    }

    await pool.query('DELETE FROM tipos_animatronicos WHERE id = ?', [id]);
  }
}

module.exports = new TiposAnimatronicosService();
