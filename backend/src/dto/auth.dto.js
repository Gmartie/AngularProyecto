class AuthDTO {
  static toLoginResponse(usuario, token, roles = []) {
    return {
      token,
      usuario: {
        id: usuario.id,
        usuario: usuario.usuario,
        correo: usuario.correo,  // Campo de la BD original
        id_rol: usuario.id_rol,  // Campo de la BD original
        roles: roles  // Array de roles para compatibilidad con el frontend
      }
    };
  }
}

module.exports = AuthDTO;