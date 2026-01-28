const AnimatronicoService = require('../services/animatronicos.service');
const AnimatronicoDTO = require('../dto/animatronicos.dto');
const ResponseUtil = require('../utils/response.util');

class AnimatronicosController {
  async getAll(req, res) {
    try {
      const animas = await AnimatronicoService.getAll();
      const response = animas.map(a => AnimatronicoDTO.toResponse(a));
      return ResponseUtil.success(res, response);
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
      const anima = await AnimatronicoService.create(req.body);
      const response = AnimatronicoDTO.toResponse(anima);
      return ResponseUtil.created(res, response, 'Animatrónico creado exitosamente');
    } catch (error) {
      return ResponseUtil.error(res, error.message, error.statusCode || 500);
    }
  }

  async update(req, res) {
    try {
      const anima = await AnimatronicoService.update(req.params.id, req.body);
      const response = AnimatronicoDTO.toResponse(anima);
      return ResponseUtil.success(res, response, 'Animatrónico actualizado exitosamente');
    } catch (error) {
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
}

module.exports = new AnimatronicosController();
