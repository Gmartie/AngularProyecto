const pool = require('../config/database');
const { ForbiddenError } = require('../utils/errors.util');
const ResponseUtil = require('../utils/response.util');

const checkPermission = (recurso, accion) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;

      const query = `
        SELECT p.* 
        FROM permisos p
        INNER JOIN roles_permisos rp ON p.id = rp.permiso_id
        INNER JOIN usuarios_roles ur ON rp.rol_id = ur.rol_id
        WHERE ur.usuario_id = ? 
        AND p.recurso = ? 
        AND p.accion = ?
      `;

      const [permisos] = await pool.query(query, [userId, recurso, accion]);

      if (permisos.length === 0) {
        throw new ForbiddenError('No tienes permisos para realizar esta accion');
      }

      next();
    } catch (error) {
      return ResponseUtil.error(res, error.message, error.statusCode || 403);
    }
  };
};

const checkRole = (...roles) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;

      const query = `
        SELECT r.nombre 
        FROM roles r
        INNER JOIN usuarios_roles ur ON r.id = ur.rol_id
        WHERE ur.usuario_id = ?
      `;

      const [userRoles] = await pool.query(query, [userId]);

      const hasRole = userRoles.some(r => roles.includes(r.nombre));

      if (!hasRole) {
        throw new ForbiddenError('No tienes el rol necesario para esta accion');
      }

      next();
    } catch (error) {
      return ResponseUtil.error(res, error.message, error.statusCode || 403);
    }
  };
};

module.exports = { checkPermission, checkRole };