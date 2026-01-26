const pool = require('../config/database');
const { NotFoundError } = require('../utils/errors.util');

class RolesService {

  async getAll() {
    const [rows] = await pool.query('SELECT * FROM roles');
    return rows;
  }

  async getById(id) {
    const [rows] = await pool.query('SELECT * FROM roles WHERE id = ?', [id]);
    if (!rows.length) throw new NotFoundError('Rol no encontrado');
    return rows[0];
  }

  async create(data) {
    const { rol } = data;

    const [result] = await pool.query(
      `INSERT INTO roles (rol) VALUES (?)`,
      [rol]
    );

    return this.getById(result.insertId);
  }

  async update(id, data) {
    await this.getById(id);

    if (data.rol) {
      await pool.query('UPDATE roles SET rol = ? WHERE id = ?', [data.rol, id]);
    }

    return this.getById(id);
  }

  async delete(id) {
    await this.getById(id);
    await pool.query('DELETE FROM roles WHERE id = ?', [id]);
  }
}

module.exports = new RolService();
