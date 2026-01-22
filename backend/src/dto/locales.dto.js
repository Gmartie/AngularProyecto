class LocalesDTO {
  static toResponse(local) {
    return {
      id: local.id,
      fecha_apertura: local.fecha_apertura,
      aforo: local.aforo,
      foto: local.foto,
      ciudad: local.ciudad,
      direccion: local.direccion,
      abierto: local.abierto
    };
  }

}

module.exports = LocalesDTO;