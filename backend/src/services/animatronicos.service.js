const pool = require('../config/database');
const { NotFoundError, ValidationError } = require('../utils/errors.util');
const fs = require('fs');
const path = require('path');

class AnimatronicoService {

  // Ahora usa la tabla intermedia animatronico_local
  async getAll(id_local = null) {
    let query = `
      SELECT 
        a.*,
        ta.nombre as nombre_gama,
        al.fecha_instalacion,
        al.estado,
        al.id_local
      FROM animatronicos a
      INNER JOIN tipos_animatronicos ta ON a.id_gama = ta.id
      LEFT JOIN animatronico_local al ON a.id = al.id_animatronico
    `;
    
    const params = [];
    
    // Si se proporciona id_local, filtrar por ese local usando la tabla intermedia
    if (id_local) {
      query += ' WHERE al.id_local = ?';
      params.push(id_local);
    }
    
    const [rows] = await pool.query(query, params);
    return rows;
  }

  async getById(id) {
    const query = `
      SELECT 
        a.*,
        ta.nombre as nombre_gama
      FROM animatronicos a
      INNER JOIN tipos_animatronicos ta ON a.id_gama = ta.id
      WHERE a.id = ?
    `;
    const [rows] = await pool.query(query, [id]);
    if (!rows.length) throw new NotFoundError('Animatrónico no encontrado');
    return rows[0];
  }

  /**
   * Obtiene el id_gama (tipo de animatrónico) según el id_local del usuario
   * usando la relación en animatronico_local
   */
  async obtenerIdGamaPorLocal(id_local) {
    // Primero, verificamos qué tipos de animatrónicos están asignados a este local
    const [rows] = await pool.query(`
      SELECT DISTINCT ta.id, ta.nombre
      FROM tipos_animatronicos ta
      INNER JOIN animatronicos a ON a.id_gama = ta.id
      INNER JOIN animatronico_local al ON al.id_animatronico = a.id
      WHERE al.id_local = ?
      LIMIT 1
    `, [id_local]);
    
    if (!rows.length) {
      throw new ValidationError(`No existe un tipo de animatrónico asignado al local ${id_local}`);
    }
    
    return rows[0].id;
  }

  async create(data, id_local) {
    const { nombre, reconocimiento, num_piezas, planos, foto } = data;

    // Obtener automáticamente el id_gama según el local del usuario
    const id_gama = await this.obtenerIdGamaPorLocal(id_local);

    console.log('Insertando en BD:', { nombre, reconocimiento, num_piezas, id_gama, planos, foto });

    const [result] = await pool.query(
      `INSERT INTO animatronicos 
       (nombre, reconocimiento, num_piezas, id_gama, planos, foto)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre, reconocimiento, num_piezas, id_gama, planos, foto]
    );

    const animatronico_id = result.insertId;

    // Insertar en la tabla intermedia animatronico_local
    await pool.query(
      `INSERT INTO animatronico_local 
       (id_animatronico, id_local, fecha_instalacion, estado)
       VALUES (?, ?, CURDATE(), 'Operativo')`,
      [animatronico_id, id_local]
    );

    console.log('Animatrónico creado con ID:', animatronico_id);
    return this.getById(animatronico_id);
  }

  async update(id, data) {
    // Obtener el animatrónico actual para eliminar archivos antiguos si se reemplazan
    const animaActual = await this.getById(id);

    const updates = [];
    const values = [];

    if (data.nombre) updates.push('nombre = ?'), values.push(data.nombre);
    if (data.reconocimiento !== undefined) updates.push('reconocimiento = ?'), values.push(data.reconocimiento);
    if (data.num_piezas) updates.push('num_piezas = ?'), values.push(data.num_piezas);
    
    // Si se sube nueva foto, eliminar la antigua
    if (data.foto && data.foto !== animaActual.foto) {
      updates.push('foto = ?');
      values.push(data.foto);
      this.eliminarArchivo(animaActual.foto, 'foto');
    }
    
    // Si se suben nuevos planos, eliminar los antiguos
    if (data.planos && data.planos !== animaActual.planos) {
      updates.push('planos = ?');
      values.push(data.planos);
      this.eliminarArchivo(animaActual.planos, 'planos');
    }

    if (updates.length) {
      values.push(id);
      console.log('Actualizando animatrónico:', { updates: updates.join(', '), values });
      await pool.query(
        `UPDATE animatronicos SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    }

    return this.getById(id);
  }

  async delete(id) {
    // Obtener el animatrónico antes de eliminarlo para borrar sus archivos
    const anima = await this.getById(id);
    
    // Eliminar archivos asociados
    this.eliminarArchivo(anima.foto, 'foto');
    this.eliminarArchivo(anima.planos, 'planos');
    
    // La tabla intermedia se eliminará automáticamente por CASCADE
    // Eliminar registro de la BD
    await pool.query('DELETE FROM animatronicos WHERE id = ?', [id]);
    
    console.log(`Animatrónico ${id} eliminado junto con sus archivos y relaciones`);
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
   * Asigna un animatrónico a un local
   */
  async asignarALocal(id_animatronico, id_local, fecha_instalacion = null, estado = 'Operativo') {
    // Verificar que el animatrónico existe
    await this.getById(id_animatronico);

    // Verificar si ya existe la relación
    const [existing] = await pool.query(
      'SELECT * FROM animatronico_local WHERE id_animatronico = ? AND id_local = ?',
      [id_animatronico, id_local]
    );

    if (existing.length > 0) {
      throw new ValidationError('El animatrónico ya está asignado a este local');
    }

    // Insertar la relación
    await pool.query(
      `INSERT INTO animatronico_local 
       (id_animatronico, id_local, fecha_instalacion, estado)
       VALUES (?, ?, ?, ?)`,
      [id_animatronico, id_local, fecha_instalacion || new Date(), estado]
    );

    return { message: 'Animatrónico asignado al local correctamente' };
  }

  /**
   * Remueve un animatrónico de un local
   */
  async removerDeLocal(id_animatronico, id_local) {
    const [result] = await pool.query(
      'DELETE FROM animatronico_local WHERE id_animatronico = ? AND id_local = ?',
      [id_animatronico, id_local]
    );

    if (result.affectedRows === 0) {
      throw new NotFoundError('Relación animatrónico-local no encontrada');
    }

    return { message: 'Animatrónico removido del local correctamente' };
  }

  /**
   * Elimina un archivo del sistema de archivos
   */
  eliminarArchivo(nombreArchivo, tipo) {
    // No eliminar archivos por defecto
    const archivosDefault = [
      'freddy_clasico.jpg',
      'freddy_clasico_planos.png',
      'bonnie_clasico.jpg',
      'chica_clasica.jpg',
      'foxy_clasico.jpg'
    ];
    
    if (!nombreArchivo || archivosDefault.includes(nombreArchivo)) {
      return; // No eliminar archivos por defecto
    }

    try {
      let rutaArchivo;
      
      if (tipo === 'foto') {
        rutaArchivo = path.join(__dirname, '../../../frontend/public/FNaF_Profile', nombreArchivo);
      } else if (tipo === 'planos') {
        rutaArchivo = path.join(__dirname, '../../../frontend/public/FNAF_Blueprints', nombreArchivo);
      }
      
      if (rutaArchivo && fs.existsSync(rutaArchivo)) {
        fs.unlinkSync(rutaArchivo);
        console.log(`Archivo eliminado: ${nombreArchivo}`);
      }
    } catch (error) {
      console.error(`Error al eliminar archivo ${nombreArchivo}:`, error.message);
      // No lanzar error, solo registrar - no queremos que falle la eliminación del registro
    }
  }

  async getInforme(id) {
    const query = `
      SELECT
        a.id,
        a.nombre,
        a.reconocimiento,
        a.num_piezas,
        a.foto,
        a.planos,
        ta.nombre      AS nombre_gama,
        l.ciudad       AS local_ciudad,
        l.direccion    AS local_direccion,
        al.estado      AS estado,
        al.fecha_instalacion
      FROM animatronicos a
      INNER JOIN tipos_animatronicos ta ON a.id_gama = ta.id
      LEFT JOIN animatronico_local al   ON al.id_animatronico = a.id
      LEFT JOIN locales l               ON l.id = al.id_local
      WHERE a.id = ?
      LIMIT 1
    `;
    const [rows] = await pool.query(query, [id]);
    if (!rows.length) throw new NotFoundError('Animatrónico no encontrado');
    return rows[0];
  }
}

module.exports = new AnimatronicoService();