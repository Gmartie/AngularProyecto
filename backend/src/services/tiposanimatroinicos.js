const pool = require('../config/database');
const { NotFoundError } = require('../utils/errors.util');

class TipoAnimatronicosService {

  async getAll() {
    const [rows] = await pool.query('SELECT * FROM tipos_animatronicos');
    return rows;
  }

  async getById(id) {
    const [rows] = await pool.query('SELECT * FROM tipos_animatronicos WHERE id = ?', [id]);
    if (!rows.length) throw new NotFoundError('Tipo no encontrado');
    return rows[0];
  }

  async create(data) {
    const { nombre, id_local } = data;

    const [result] = await pool.query(
      `INSERT INTO tipos_animatronicos (nombre, id_local)
       VALUES (?, ?)`,
      [nombre, id_local]
    );

    return this.getById(result.insertId);
  }

  async update(id, data) {
    await this.getById(id);

    const updates = [];
    const values = [];

    if (data.nombre) updates.push('nombre = ?'), values.push(data.nombre);
    if (data.id_local) updates.push('id_local = ?'), values.push(data.id_local);

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
    await this.getById(id);
    await pool.query('DELETE FROM tipos_animatronicos WHERE id = ?', [id]);
  }
}

module.exports = new TipoAnimatronicosService();
