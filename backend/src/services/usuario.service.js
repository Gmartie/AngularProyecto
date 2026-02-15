const pool = require('../config/database');
const { NotFoundError, ValidationError } = require('../utils/errors.util');

class UsuarioService {

  async getAll() {
    const [rows] = await pool.query('SELECT * FROM usuario');
    return rows;
  }

  async getById(id) {
    const [rows] = await pool.query('SELECT * FROM usuario WHERE id = ?', [id]);
    if (!rows.length) throw new NotFoundError('Usuario no encontrado');
    return rows[0];
  }

  async create(usuarioData) {
    const { usuario, pass, correo, id_rol, id_local } = usuarioData;

    const [existing] = await pool.query('SELECT id FROM usuario WHERE usuario = ?', [usuario]);
    if (existing.length > 0) {
      throw new ValidationError('Ya existe un usuario con ese nombre');
    }

    const [result] = await pool.query(
      'INSERT INTO usuario (usuario, pass, correo, id_rol, id_local) VALUES (?, ?, ?, ?, ?)',
      [usuario, pass, correo, id_rol, id_local || 0]
    );

    return this.getById(result.insertId);
  }

  async update(id, usuarioData) {
    await this.getById(id);

    const updates = [];
    const values = [];

    if (usuarioData.usuario) {
      updates.push('usuario = ?');
      values.push(usuarioData.usuario);
    }
    if (usuarioData.pass) {
      updates.push('pass = ?');
      values.push(usuarioData.pass);
    }
    if (usuarioData.correo) {
      updates.push('correo = ?');
      values.push(usuarioData.correo);
    }
    if (usuarioData.id_rol !== undefined) {
      updates.push('id_rol = ?');
      values.push(usuarioData.id_rol);
    }
    if (usuarioData.id_local !== undefined) {
      updates.push('id_local = ?');
      values.push(usuarioData.id_local);
    }

    if (updates.length > 0) {
      values.push(id);
      await pool.query(
        `UPDATE usuario SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    }

    return this.getById(id);
  }

  async delete(id) {
    await this.getById(id);
    await pool.query('DELETE FROM usuario WHERE id = ?', [id]);
  }
}

module.exports = new UsuarioService();
