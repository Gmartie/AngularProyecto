const usuarioService = require('../services/usuario.service');
const UsuarioDTO = require('../dto/usuario.dto');
const ResponseUtil = require('../utils/response.util');

class UsuarioController {
  async getAll(req, res) {
    try {
      const usuarios = await usuarioService.getAll();
      const response = usuarios.map(m => UsuarioDTO.toResponse(m));
      return ResponseUtil.success(res, response);
    } catch (error) {
      return ResponseUtil.error(res, error.message, error.statusCode || 500);
    }
  }

  async getById(req, res) {
    try {
      const usuario = await usuarioService.getById(req.params.id);
      const response = UsuarioDTO.toResponse(usuario);
      return ResponseUtil.success(res, response);
    } catch (error) {
      return ResponseUtil.error(res, error.message, error.statusCode || 500);
    }
  }

  async create(req, res) {
    try {
      const usuario = await usuarioService.create(req.body);
      const response = UsuarioDTO.toResponse(usuario);
      return ResponseUtil.created(res, response, 'Usuario creado exitosamente');
    } catch (error) {
      return ResponseUtil.error(res, error.message, error.statusCode || 500);
    }
  }

  async update(req, res) {
    try {
      const usuario = await usuarioService.update(req.params.id, req.body);
      const response = UsuarioDTO.toResponse(usuario);
      return ResponseUtil.success(res, response, 'usuario actualizado exitosamente');
    } catch (error) {
      return ResponseUtil.error(res, error.message, error.statusCode || 500);
    }
  }

  async delete(req, res) {
    try {
      await usuarioService.delete(req.params.id);
      return ResponseUtil.success(res, null, 'usuario eliminado exitosamente');
    } catch (error) {
      return ResponseUtil.error(res, error.message, error.statusCode || 500);
    }
  }

  async login(req, res) {
  try {
    const { usuario, pass } = req.body;
    const user = await usuarioService.login(usuario, pass);
    return ResponseUtil.success(res, user);
  } catch (error) {
    return ResponseUtil.error(res, error.message, 401);
  }
}

}

module.exports = new UsuarioController();
