class AuthDTO {
  static toLoginResponse(usuario, token, roles = []) {
    return {
      token,
      usuario: {
        id: usuario.id,
        usuario: usuario.usuario,
        email: usuario.email,
        activo: usuario.activo,
        roles: roles.map(r => ({ id: r.id, nombre: r.nombre }))
      }
    };
  }
}

module.exports = AuthDTO;