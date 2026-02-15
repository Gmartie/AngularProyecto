class UsuarioDTO {
  static toResponse(usuario) {
    return {
      id: usuario.id,
      usuario: usuario.usuario,
      correo: usuario.correo,
      id_rol: usuario.id_rol,
      id_local: usuario.id_local
    };
  }

  static toDetailResponse(usuario, roles = []) {
    return {
      id: usuario.id,
      usuario: usuario.usuario,
      correo: usuario.correo,
      id_rol: usuario.id_rol,
      id_local: usuario.id_local,
      roles: roles
    };
  }
}

module.exports = UsuarioDTO;
