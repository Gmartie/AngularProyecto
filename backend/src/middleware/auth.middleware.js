const jwt = require('jsonwebtoken');
const { UnauthorizedError } = require('../utils/errors.util');
const ResponseUtil = require('../utils/response.util');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Token no proporcionado');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      throw new UnauthorizedError('Token invalido o expirado');
    }
  } catch (error) {
    return ResponseUtil.error(res, error.message, error.statusCode || 401);
  }
};

module.exports = authMiddleware;