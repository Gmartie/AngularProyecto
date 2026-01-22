class ResponseUtil {
  static success(res, data, message = 'Operacion exitosa', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  }

  static error(res, message = 'Error en la operacion', statusCode = 500, errors = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      ...(errors && { errors })
    });
  }

  static created(res, data, message = 'Recurso creado exitosamente') {
    return this.success(res, data, message, 201);
  }
}

module.exports = ResponseUtil;