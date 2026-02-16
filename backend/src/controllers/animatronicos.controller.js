const AnimatronicoService = require('../services/animatronicos.service');
const AnimatronicoDTO = require('../dto/animatronicos.dto');
const ResponseUtil = require('../utils/response.util');

class AnimatronicosController {
  async getAll(req, res) {
    try {
      // ⭐ CAMBIO: Obtener id_local del usuario autenticado (viene del token JWT)
      const id_local = req.user?.id_local;
      
      // Filtrar por id_local del usuario
      const animas = await AnimatronicoService.getAll(id_local);
      const response = animas.map(a => AnimatronicoDTO.toResponse(a));
      return ResponseUtil.success(res, response);
    } catch (error) {
      return ResponseUtil.error(res, error.message, error.statusCode || 500);
    }
  }

  async getInforme(req, res) {
    try {
      const informe = await AnimatronicoService.getInforme(req.params.id);
      return ResponseUtil.success(res, informe, 'Informe obtenido exitosamente');
    } catch (error) {
      return ResponseUtil.error(res, error.message, error.statusCode || 500);
    }
  }

  async getById(req, res) {
    try {
      const anima = await AnimatronicoService.getById(req.params.id);
      const response = AnimatronicoDTO.toResponse(anima);
      return ResponseUtil.success(res, response);
    } catch (error) {
      return ResponseUtil.error(res, error.message, error.statusCode || 500);
    }
  }

  async create(req, res) {
    try {
      // Obtener id_local del usuario autenticado
      const id_local = req.user?.id_local;
      
      // Preparar datos del animatrónico
      const data = {
        nombre: req.body.nombre,
        reconocimiento: req.body.reconocimiento === 'true' || req.body.reconocimiento === true,
        num_piezas: parseInt(req.body.num_piezas),
        foto: req.files?.foto ? req.files.foto[0].filename : 'freddy_clasico.jpg',
        planos: req.files?.planos ? req.files.planos[0].filename : 'freddy_clasico_planos.png'
      };

      console.log('Datos a crear:', data);
      console.log('Archivos recibidos:', req.files);
      
      const anima = await AnimatronicoService.create(data, id_local);
      const response = AnimatronicoDTO.toResponse(anima);
      return ResponseUtil.created(res, response, 'Animatrónico creado exitosamente');
    } catch (error) {
      console.error('Error en create controller:', error);
      return ResponseUtil.error(res, error.message, error.statusCode || 500);
    }
  }

  async update(req, res) {
    try {
      // Obtener el animatrónico actual para mantener los valores si no se suben nuevos archivos
      const animaActual = await AnimatronicoService.getById(req.params.id);
      
      // Preparar datos del animatrónico
      const data = {
        nombre: req.body.nombre,
        reconocimiento: req.body.reconocimiento === 'true' || req.body.reconocimiento === true,
        num_piezas: parseInt(req.body.num_piezas),
        foto: req.files?.foto ? req.files.foto[0].filename : (req.body.foto || animaActual.foto),
        planos: req.files?.planos ? req.files.planos[0].filename : (req.body.planos || animaActual.planos)
      };

      console.log('Datos a actualizar:', data);
      console.log('Archivos recibidos:', req.files);
      
      const anima = await AnimatronicoService.update(req.params.id, data);
      const response = AnimatronicoDTO.toResponse(anima);
      return ResponseUtil.success(res, response, 'Animatrónico actualizado exitosamente');
    } catch (error) {
      console.error('Error en update controller:', error);
      return ResponseUtil.error(res, error.message, error.statusCode || 500);
    }
  }

  async delete(req, res) {
    try {
      await AnimatronicoService.delete(req.params.id);
      return ResponseUtil.success(res, null, 'Animatrónico eliminado exitosamente');
    } catch (error) {
      return ResponseUtil.error(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * ⭐ NUEVO: Actualiza el estado de un animatrónico en un local
   */
  async actualizarEstado(req, res) {
    try {
      const id_animatronico = req.params.id;
      const id_local = req.user?.id_local;
      const { estado } = req.body;

      if (!estado) {
        return ResponseUtil.error(res, 'El campo estado es requerido', 400);
      }

      const result = await AnimatronicoService.actualizarEstado(id_animatronico, id_local, estado);
      return ResponseUtil.success(res, result, 'Estado actualizado exitosamente');
    } catch (error) {
      return ResponseUtil.error(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * ⭐ NUEVO: Asigna un animatrónico a un local
   */
  async asignarALocal(req, res) {
    try {
      const id_animatronico = req.params.id;
      const { id_local, fecha_instalacion, estado } = req.body;

      if (!id_local) {
        return ResponseUtil.error(res, 'El campo id_local es requerido', 400);
      }

      const result = await AnimatronicoService.asignarALocal(
        id_animatronico, 
        id_local, 
        fecha_instalacion, 
        estado
      );
      return ResponseUtil.success(res, result, 'Animatrónico asignado al local exitosamente');
    } catch (error) {
      return ResponseUtil.error(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * ⭐ NUEVO: Remueve un animatrónico de un local
   */
  async removerDeLocal(req, res) {
    try {
      const id_animatronico = req.params.id;
      const id_local = req.user?.id_local;

      const result = await AnimatronicoService.removerDeLocal(id_animatronico, id_local);
      return ResponseUtil.success(res, result, 'Animatrónico removido del local exitosamente');
    } catch (error) {
      return ResponseUtil.error(res, error.message, error.statusCode || 500);
    }
  }
}

module.exports = new AnimatronicosController();
