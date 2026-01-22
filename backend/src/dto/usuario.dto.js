class UsuarioDTO {
  static toResponse(usuario) {
    return {
      id: usuario.id,
      usuario: usuario.usuario,
      pass: usuario.pass,
      email: usuario.email,
      id_rol: usuario.id_rol
    };
  }

}

module.exports = UsuarioDTO;