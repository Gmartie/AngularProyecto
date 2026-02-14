const pool = require('../config/database');
const { NotFoundError, ValidationError } = require('../utils/errors.util');

class AnimatronicoLocalService {

  /**
   * Obtiene todas las relaciones animatrónico-local con información completa
   */
  async getAll() {
    const query = `
      SELECT 
        al.*,
        a.nombre as animatronico_nombre,
        a.foto as animatronico_foto,
        ta.nombre as animatronico_gama,
        l.ciudad as local_ciudad,
        l.direccion as local_direccion
      FROM animatronico_local al
      INNER JOIN animatronicos a ON al.id_animatronico = a.id
      INNER JOIN tipos_animatronicos ta ON a.id_gama = ta.id
      INNER JOIN locales l ON al.id_local = l.id
      ORDER BY al.id_local, a.nombre
    `;
    
    const [rows] = await pool.query(query);
    return rows;
  }

  /**
   * Obtiene las relaciones de un local específico
   */
  async getByLocal(id_local) {
    const query = `
      SELECT 
        al.*,
        a.nombre as animatronico_nombre,
        a.foto as animatronico_foto,
        ta.nombre as animatronico_gama,
        l.ciudad as local_ciudad,
        l.direccion as local_direccion
      FROM animatronico_local al
      INNER JOIN animatronicos a ON al.id_animatronico = a.id
      INNER JOIN tipos_animatronicos ta ON a.id_gama = ta.id
      INNER JOIN locales l ON al.id_local = l.id
      WHERE al.id_local = ?
      ORDER BY a.nombre
    `;
    
    const [rows] = await pool.query(query, [id_local]);
    return rows;
  }

  /**
   * Asigna un animatrónico a un local
   */
  async asignar(data) {
    const { id_animatronico, id_local, fecha_instalacion, estado } = data;

    // Verificar que no existe ya la relación
    const [existing] = await pool.query(
      'SELECT * FROM animatronico_local WHERE id_animatronico = ? AND id_local = ?',
      [id_animatronico, id_local]
    );

    if (existing.length > 0) {
      throw new ValidationError('Este animatrónico ya está asignado a este local');
    }

    // Insertar la relación
    await pool.query(
      `INSERT INTO animatronico_local 
       (id_animatronico, id_local, fecha_instalacion, estado)
       VALUES (?, ?, ?, ?)`,
      [id_animatronico, id_local, fecha_instalacion || new Date(), estado || 'Operativo']
    );

    return { message: 'Animatrónico asignado al local exitosamente' };
  }

  /**
   * Actualiza el estado de un animatrónico en un local
   */
  async actualizarEstado(id_animatronico, id_local, estado) {
    const [result] = await pool.query(
      `UPDATE animatronico_local 
       SET estado = ?
       WHERE id_animatronico = ? AND id_local = ?`,
      [estado, id_animatronico, id_local]
    );

    if (result.affectedRows === 0) {
      throw new NotFoundError('Relación animatrónico-local no encontrada');
    }

    return { message: 'Estado actualizado correctamente' };
  }

  /**
   * Remueve un animatrónico de un local
   */
  async remover(id_animatronico, id_local) {
    const [result] = await pool.query(
      'DELETE FROM animatronico_local WHERE id_animatronico = ? AND id_local = ?',
      [id_animatronico, id_local]
    );

    if (result.affectedRows === 0) {
      throw new NotFoundError('Relación animatrónico-local no encontrada');
    }

    return { message: 'Animatrónico removido del local correctamente' };
  }
}

module.exports = new AnimatronicoLocalService();
