const pool = require('../config/database');
const { NotFoundError, ValidationError } = require('../utils/errors.util');

class UsuarioService {
  async create(usuarioData) {
    const { id, usuario, pass, correo, profesorId } = usuarioData;

    const [existing] = await pool.query('SELECT id FROM usuario WHERE id = ?', [id]);
    
    if (existing.length > 0) {
      throw new ValidationError('Ya existe un usuario con ese id');
    }

    const [result] = await pool.query(
      'INSERT INTO usuario (id, usuario, pass, correo, id_rol, id_local) VALUES (?, ?, ?, ?, ?, ?)',
      [id, usuario, pass, correo, id_rol, id_local || null]
    );

    return this.getById(result.insertId);
  }

  async update(id, usuarioData) {
    await this.getById(id);

    const updates = [];
    const values = [];

    if (usuarioData.id) {
      updates.push('id = ?');
      values.push(usuarioData.id);
    }
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

  async login(usuario, pass) {
  const user = await Usuario.findOne({
    where: { usuario, pass }
  });

  if (!user) throw new Error('Credenciales incorrectas');
  return user;
}


}

module.exports = new UsuarioService();