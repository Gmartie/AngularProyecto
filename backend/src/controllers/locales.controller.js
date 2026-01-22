const LocalesService = require('../services/locales.service');
const LocalesDTO = require('../dto/locales.dto');
const ResponseUtil = require('../utils/response.util');

class localesController {
  async getAll(req, res) {
    try {
      const localess = await LocalesService.getAll();
      const response = localess.map(m => LocalesDTO.toResponse(m));
      return ResponseUtil.success(res, response);
    } catch (error) {
      return ResponseUtil.error(res, error.message, error.statusCode || 500);
    }
  }

  async getById(req, res) {
    try {
      const locales = await LocalesService.getById(req.params.id);
      const response = LocalesDTO.toResponse(locales);
      return ResponseUtil.success(res, response);
    } catch (error) {
      return ResponseUtil.error(res, error.message, error.statusCode || 500);
    }
  }

  async create(req, res) {
    try {
      const locales = await LocalesService.create(req.body);
      const response = LocalesDTO.toResponse(locales);
      return ResponseUtil.created(res, response, 'locales creado exitosamente');
    } catch (error) {
      return ResponseUtil.error(res, error.message, error.statusCode || 500);
    }
  }

  async update(req, res) {
    try {
      const locales = await LocalesService.update(req.params.id, req.body);
      const response = LocalesDTO.toResponse(locales);
      return ResponseUtil.success(res, response, 'locales actualizado exitosamente');
    } catch (error) {
      return ResponseUtil.error(res, error.message, error.statusCode || 500);
    }
  }

  async delete(req, res) {
    try {
      await LocalesService.delete(req.params.id);
      return ResponseUtil.success(res, null, 'locales eliminado exitosamente');
    } catch (error) {
      return ResponseUtil.error(res, error.message, error.statusCode || 500);
    }
  }
}

module.exports = new localesController();