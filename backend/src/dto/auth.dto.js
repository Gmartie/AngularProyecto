class AuthDTO {
  static toLoginResponse(usuario, token, roles = []) {
    return {
      token,
      usuario: {
        id: usuario.id,
        usuario: usuario.usuario,
        correo: usuario.correo,
        id_rol: usuario.id_rol,
        id_local: usuario.id_local,
        roles: roles
      }
    };
  }
}

module.exports = AuthDTO;
