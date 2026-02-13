const pool = require('../config/database');
const { NotFoundError, ValidationError } = require('../utils/errors.util');
const fs = require('fs');
const path = require('path');

class AnimatronicoService {

  // ⭐ CAMBIO: Modificado para filtrar por id_local
  async getAll(id_local = null) {
    let query = `
      SELECT a.* 
      FROM animatronicos a
      INNER JOIN tipos_animatronicos ta ON a.id_gama = ta.id
    `;
    
    const params = [];
    
    // Si se proporciona id_local, filtrar por ese local
    if (id_local) {
      query += ' WHERE ta.id_local = ?';
      params.push(id_local);
    }
    
    const [rows] = await pool.query(query, params);
    return rows;
  }

  async getById(id) {
    const [rows] = await pool.query('SELECT * FROM animatronicos WHERE id = ?', [id]);
    if (!rows.length) throw new NotFoundError('Animatrónico no encontrado');
    return rows[0];
  }

  /**
   * Obtiene el id_gama (tipo de animatrónico) según el id_local del usuario
   */
  async obtenerIdGamaPorLocal(id_local) {
    const [rows] = await pool.query(
      'SELECT id FROM tipos_animatronicos WHERE id_local = ? LIMIT 1',
      [id_local]
    );
    
    if (!rows.length) {
      throw new ValidationError(`No existe un tipo de animatrónico para el local ${id_local}`);
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

    console.log('Animatrónico creado con ID:', result.insertId);
    return this.getById(result.insertId);
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
    
    // Eliminar registro de la BD
    await pool.query('DELETE FROM animatronicos WHERE id = ?', [id]);
    
    console.log(`✅ Animatrónico ${id} eliminado junto con sus archivos`);
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
        console.log(`🗑️ Archivo eliminado: ${nombreArchivo}`);
      }
    } catch (error) {
      console.error(`❌ Error al eliminar archivo ${nombreArchivo}:`, error.message);
      // No lanzar error, solo registrar - no queremos que falle la eliminación del registro
    }
  }
}

module.exports = new AnimatronicoService();
