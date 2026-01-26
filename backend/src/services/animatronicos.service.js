const pool = require('../config/database');
const { NotFoundError, ValidationError } = require('../utils/errors.util');

class AnimatronicoService {

  async getAll() {
    const [rows] = await pool.query('SELECT * FROM animatronicos');
    return rows;
  }

  async getById(id) {
    const [rows] = await pool.query('SELECT * FROM animatronicos WHERE id = ?', [id]);
    if (!rows.length) throw new NotFoundError('Animatrónico no encontrado');
    return rows[0];
  }

  async create(data) {
    const { nombre, reconocimiento, num_piezas, id_gama, planos, foto } = data;

    const [result] = await pool.query(
      `INSERT INTO animatronicos 
       (nombre, reconocimiento, num_piezas, id_gama, planos, foto)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre, reconocimiento, num_piezas, id_gama, planos, foto]
    );

    return this.getById(result.insertId);
  }

  async update(id, data) {
    await this.getById(id);

    const updates = [];
    const values = [];

    if (data.nombre) updates.push('nombre = ?'), values.push(data.nombre);
    if (data.reconocimiento !== undefined) updates.push('reconocimiento = ?'), values.push(data.reconocimiento);
    if (data.num_piezas) updates.push('num_piezas = ?'), values.push(data.num_piezas);
    if (data.id_gama) updates.push('id_gama = ?'), values.push(data.id_gama);
    if (data.planos) updates.push('planos = ?'), values.push(data.planos);
    if (data.foto) updates.push('foto = ?'), values.push(data.foto);

    if (updates.length) {
      values.push(id);
      await pool.query(
        `UPDATE animatronicos SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    }

    return this.getById(id);
  }

  async delete(id) {
    await this.getById(id);
    await pool.query('DELETE FROM animatronicos WHERE id = ?', [id]);
  }
}

module.exports = new AnimatronicoService();
