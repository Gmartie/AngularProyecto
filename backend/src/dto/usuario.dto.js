class UsuarioDTO {
  static toResponse(usuario) {
    return {
      id: usuario.id,
      usuario: usuario.usuario,
      pass: usuario.pass,
      correo: usuario.correo,
      id_rol: usuario.id_rol
    };
  }

}

module.exports = UsuarioDTO;