const RolService = require('../services/rol.service');
const RolDTO = require('../dto/rol.dto');
const ResponseUtil = require('../utils/response.util');

class RolController {
  async getAll(req, res) {
    try {
      const roles = await RolService.getAll();
      const response = roles.map(r => RolDTO.toResponse(r));
      return ResponseUtil.success(res, response);
    } catch (error) {
      return ResponseUtil.error(res, error.message, error.statusCode || 500);
    }
  }

  async getById(req, res) {
    try {
      const rol = await RolService.getById(req.params.id);
      const response = RolDTO.toResponse(rol);
      return ResponseUtil.success(res, response);
    } catch (error) {
      return ResponseUtil.error(res, error.message, error.statusCode || 500);
    }
  }

  async create(req, res) {
    try {
      const rol = await RolService.create(req.body);
      const response = RolDTO.toResponse(rol);
      return ResponseUtil.created(res, response, 'Rol creado exitosamente');
    } catch (error) {
      return ResponseUtil.error(res, error.message, error.statusCode || 500);
    }
  }

  async update(req, res) {
    try {
      const rol = await RolService.update(req.params.id, req.body);
      const response = RolDTO.toResponse(rol);
      return ResponseUtil.success(res, response, 'Rol actualizado exitosamente');
    } catch (error) {
      return ResponseUtil.error(res, error.message, error.statusCode || 500);
    }
  }

  async delete(req, res) {
    try {
      await RolService.delete(req.params.id);
      return ResponseUtil.success(res, null, 'Rol eliminado exitosamente');
    } catch (error) {
      return ResponseUtil.error(res, error.message, error.statusCode || 500);
    }
  }
}

module.exports = new RolController();
