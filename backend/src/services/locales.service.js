const pool = require('../config/database');
const { NotFoundError, ValidationError } = require('../utils/errors.util');

class LocalesService {
  async create(localesData) {
    const { id, locales, pass, correo, profesorId } = localesData;

    const [existing] = await pool.query('SELECT id FROM locales WHERE id = ?', [id]);
    
    if (existing.length > 0) {
      throw new ValidationError('Ya existe un locales con ese id');
    }

    const [result] = await pool.query(
      'INSERT INTO locales (id, locales, pass, correo, id_rol) VALUES (?, ?, ?, ?, ?)',
      [id, locales, pass, correo, profesorId || null]
    );

    return this.getById(result.insertId);
  }

  async update(id, localesData) {
    await this.getById(id);

    const updates = [];
    const values = [];

    if (localesData.id) {
      updates.push('id = ?');
      values.push(localesData.id);
    }
    if (localesData.locales) {
      updates.push('locales = ?');
      values.push(localesData.locales);
    }
    if (localesData.pass) {
      updates.push('pass = ?');
      values.push(localesData.pass);
    }
    if (localesData.correo) {
      updates.push('correo = ?');
      values.push(localesData.correo);
    }
    if (localesData.profesorId !== undefined) {
      updates.push('id_rol = ?');
      values.push(localesData.profesorId);
    }

    if (updates.length > 0) {
      values.push(id);
      await pool.query(
        `UPDATE locales SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    }

    return this.getById(id);
  }

  async delete(id) {
    await this.getById(id);
    await pool.query('DELETE FROM locales WHERE id = ?', [id]);
  }
}

module.exports = new LocalesService();