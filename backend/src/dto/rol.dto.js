class RolDTO {
  static toResponse(rol) {
    return {
      id: rol.id,
      rol: rol.rol
    };
  }

}

module.exports = RolDTO;