const TipoService = require('../services/tiposanimatronicos.service');
const TipoDTO = require('../dto/tiposanimatronicos.dto');
const ResponseUtil = require('../utils/response.util');

class TiposAnimatronicosController {
  async getAll(req, res) {
    try {
      const tipos = await TipoService.getAll();
      const response = tipos.map(t => TipoDTO.toResponse(t));
      return ResponseUtil.success(res, response);
    } catch (error) {
      return ResponseUtil.error(res, error.message, error.statusCode || 500);
    }
  }

  async getById(req, res) {
    try {
      const tipo = await TipoService.getById(req.params.id);
      const response = TipoDTO.toResponse(tipo);
      return ResponseUtil.success(res, response);
    } catch (error) {
      return ResponseUtil.error(res, error.message, error.statusCode || 500);
    }
  }

  async create(req, res) {
    try {
      const tipo = await TipoService.create(req.body);
      const response = TipoDTO.toResponse(tipo);
      return ResponseUtil.created(res, response, 'Tipo creado exitosamente');
    } catch (error) {
      return ResponseUtil.error(res, error.message, error.statusCode || 500);
    }
  }

  async update(req, res) {
    try {
      const tipo = await TipoService.update(req.params.id, req.body);
      const response = TipoDTO.toResponse(tipo);
      return ResponseUtil.success(res, response, 'Tipo actualizado exitosamente');
    } catch (error) {
      return ResponseUtil.error(res, error.message, error.statusCode || 500);
    }
  }

  async delete(req, res) {
    try {
      await TipoService.delete(req.params.id);
      return ResponseUtil.success(res, null, 'Tipo eliminado exitosamente');
    } catch (error) {
      return ResponseUtil.error(res, error.message, error.statusCode || 500);
    }
  }
}

module.exports = new TiposAnimatronicosController();
