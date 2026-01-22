const pool = require('../config/database');
const { NotFoundError, ValidationError } = require('../utils/errors.util');

class ModuloService {
  async getAll(curso = null) {
    let query = `
      SELECT m.*, p.nombre as profesor_nombre 
      FROM modulos m
      LEFT JOIN profesores p ON m.profesor_id = p.id
    `;
    
    const params = [];
    
    if (curso) {
      query += ' WHERE m.curso = ?';
      params.push(curso);
    }
    
    query += ' ORDER BY m.curso, m.codigo';

    const [modulos] = await pool.query(query, params);
    return modulos;
  }

  async getById(id) {
    const query = `
      SELECT m.*, p.nombre as profesor_nombre 
      FROM modulos m
      LEFT JOIN profesores p ON m.profesor_id = p.id
      WHERE m.id = ?
    `;

    const [modulos] = await pool.query(query, [id]);

    if (modulos.length === 0) {
      throw new NotFoundError('Modulo no encontrado');
    }

    return modulos[0];
  }

  async create(moduloData) {
    const { codigo, nombre, horasSemanales, curso, profesorId } = moduloData;

    const [existing] = await pool.query('SELECT id FROM modulos WHERE codigo = ?', [codigo]);
    
    if (existing.length > 0) {
      throw new ValidationError('Ya existe un modulo con ese codigo');
    }

    const [result] = await pool.query(
      'INSERT INTO modulos (codigo, nombre, horas_semanales, curso, profesor_id) VALUES (?, ?, ?, ?, ?)',
      [codigo, nombre, horasSemanales, curso, profesorId || null]
    );

    return this.getById(result.insertId);
  }

  async update(id, moduloData) {
    await this.getById(id);

    const updates = [];
    const values = [];

    if (moduloData.codigo) {
      updates.push('codigo = ?');
      values.push(moduloData.codigo);
    }
    if (moduloData.nombre) {
      updates.push('nombre = ?');
      values.push(moduloData.nombre);
    }
    if (moduloData.horasSemanales) {
      updates.push('horas_semanales = ?');
      values.push(moduloData.horasSemanales);
    }
    if (moduloData.curso) {
      updates.push('curso = ?');
      values.push(moduloData.curso);
    }
    if (moduloData.profesorId !== undefined) {
      updates.push('profesor_id = ?');
      values.push(moduloData.profesorId);
    }

    if (updates.length > 0) {
      values.push(id);
      await pool.query(
        `UPDATE modulos SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    }

    return this.getById(id);
  }

  async delete(id) {
    await this.getById(id);
    await pool.query('DELETE FROM modulos WHERE id = ?', [id]);
  }
}

module.exports = new ModuloService();