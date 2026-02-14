const AnimatronicoLocalService = require('../services/animatronico-local.service');
const ResponseUtil = require('../utils/response.util');

class AnimatronicoLocalController {
  async getAll(req, res) {
    try {
      const relaciones = await AnimatronicoLocalService.getAll();
      return ResponseUtil.success(res, relaciones);
    } catch (error) {
      return ResponseUtil.error(res, error.message, error.statusCode || 500);
    }
  }

  async getByLocal(req, res) {
    try {
      const relaciones = await AnimatronicoLocalService.getByLocal(req.params.id_local);
      return ResponseUtil.success(res, relaciones);
    } catch (error) {
      return ResponseUtil.error(res, error.message, error.statusCode || 500);
    }
  }

  async asignar(req, res) {
    try {
      const result = await AnimatronicoLocalService.asignar(req.body);
      return ResponseUtil.created(res, result, 'Animatrónico asignado exitosamente');
    } catch (error) {
      return ResponseUtil.error(res, error.message, error.statusCode || 500);
    }
  }

  async actualizarEstado(req, res) {
    try {
      const { id_animatronico, id_local } = req.params;
      const { estado } = req.body;
      
      const result = await AnimatronicoLocalService.actualizarEstado(
        id_animatronico, 
        id_local, 
        estado
      );
      return ResponseUtil.success(res, result, 'Estado actualizado exitosamente');
    } catch (error) {
      return ResponseUtil.error(res, error.message, error.statusCode || 500);
    }
  }

  async remover(req, res) {
    try {
      const { id_animatronico, id_local } = req.params;
      
      const result = await AnimatronicoLocalService.remover(id_animatronico, id_local);
      return ResponseUtil.success(res, result, 'Animatrónico removido exitosamente');
    } catch (error) {
      return ResponseUtil.error(res, error.message, error.statusCode || 500);
    }
  }
}

module.exports = new AnimatronicoLocalController();
