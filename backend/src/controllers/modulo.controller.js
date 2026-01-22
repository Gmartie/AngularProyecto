const moduloService = require('../services/modulo.service');
const ModuloDTO = require('../dto/modulo.dto');
const ResponseUtil = require('../utils/response.util');

class ModuloController {
  async getAll(req, res) {
    try {
      const { curso } = req.query;
      const modulos = await moduloService.getAll(curso);
      const response = modulos.map(m => ModuloDTO.toResponse(m));
      return ResponseUtil.success(res, response);
    } catch (error) {
      return ResponseUtil.error(res, error.message, error.statusCode || 500);
    }
  }

  async getById(req, res) {
    try {
      const modulo = await moduloService.getById(req.params.id);
      const response = ModuloDTO.toResponse(modulo);
      return ResponseUtil.success(res, response);
    } catch (error) {
      return ResponseUtil.error(res, error.message, error.statusCode || 500);
    }
  }

  async create(req, res) {
    try {
      const modulo = await moduloService.create(req.body);
      const response = ModuloDTO.toResponse(modulo);
      return ResponseUtil.created(res, response, 'Modulo creado exitosamente');
    } catch (error) {
      return ResponseUtil.error(res, error.message, error.statusCode || 500);
    }
  }

  async update(req, res) {
    try {
      const modulo = await moduloService.update(req.params.id, req.body);
      const response = ModuloDTO.toResponse(modulo);
      return ResponseUtil.success(res, response, 'Modulo actualizado exitosamente');
    } catch (error) {
      return ResponseUtil.error(res, error.message, error.statusCode || 500);
    }
  }

  async delete(req, res) {
    try {
      await moduloService.delete(req.params.id);
      return ResponseUtil.success(res, null, 'Modulo eliminado exitosamente');
    } catch (error) {
      return ResponseUtil.error(res, error.message, error.statusCode || 500);
    }
  }
}

module.exports = new ModuloController();