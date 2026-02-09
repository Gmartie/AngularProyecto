const pool = require('../config/database');
const { NotFoundError, ValidationError } = require('../utils/errors.util');

class LocalesService {
  /**
   * Obtener todos los locales
   */
  async getAll() {
    const [locales] = await pool.query(`
      SELECT 
        id,
        fecha_apertura,
        aforo,
        foto,
        ciudad,
        direccion,
        abierto,
        id_propietario
      FROM locales
      ORDER BY id ASC
    `);
    return locales;
  }

  /**
   * Obtener un local por ID
   */
  async getById(id) {
    const [locales] = await pool.query(`
      SELECT 
        id,
        fecha_apertura,
        aforo,
        foto,
        ciudad,
        direccion,
        abierto,
        id_propietario
      FROM locales 
      WHERE id = ?
    `, [id]);

    if (locales.length === 0) {
      throw new NotFoundError(`Local con ID ${id} no encontrado`);
    }

    return locales[0];
  }

  /**
   * Crear un nuevo local
   */
  async create(localesData) {
    const { fecha_apertura, aforo, foto, ciudad, direccion, abierto, id_propietario } = localesData;

    // Validaciones básicas
    if (!ciudad || !direccion || !aforo) {
      throw new ValidationError('Ciudad, dirección y aforo son obligatorios');
    }

    if (aforo <= 0) {
      throw new ValidationError('El aforo debe ser mayor a 0');
    }

    const [result] = await pool.query(
      `INSERT INTO locales 
        (fecha_apertura, aforo, foto, ciudad, direccion, abierto, id_propietario) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        fecha_apertura || new Date(),
        aforo,
        foto || '',
        ciudad,
        direccion,
        abierto !== undefined ? abierto : true,
        id_propietario || null
      ]
    );

    return this.getById(result.insertId);
  }

  /**
   * Actualizar un local existente
   */
  async update(id, localesData) {
    // Verificar que el local existe
    await this.getById(id);

    const updates = [];
    const values = [];

    if (localesData.fecha_apertura !== undefined) {
      updates.push('fecha_apertura = ?');
      values.push(localesData.fecha_apertura);
    }
    if (localesData.aforo !== undefined) {
      if (localesData.aforo <= 0) {
        throw new ValidationError('El aforo debe ser mayor a 0');
      }
      updates.push('aforo = ?');
      values.push(localesData.aforo);
    }
    if (localesData.foto !== undefined) {
      updates.push('foto = ?');
      values.push(localesData.foto);
    }
    if (localesData.ciudad !== undefined) {
      updates.push('ciudad = ?');
      values.push(localesData.ciudad);
    }
    if (localesData.direccion !== undefined) {
      updates.push('direccion = ?');
      values.push(localesData.direccion);
    }
    if (localesData.abierto !== undefined) {
      updates.push('abierto = ?');
      values.push(localesData.abierto);
    }
    if (localesData.id_propietario !== undefined) {
      updates.push('id_propietario = ?');
      values.push(localesData.id_propietario);
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

  /**
   * Eliminar un local
   */
  async delete(id) {
    await this.getById(id);
    await pool.query('DELETE FROM locales WHERE id = ?', [id]);
    return { message: 'Local eliminado exitosamente' };
  }
}

module.exports = new LocalesService();
