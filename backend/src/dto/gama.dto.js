class GamaDTO {

  static toResponse(gama) {
    return {
      id: gama.id,
      nombre: gama.nombre,
      id_local: gama.id_local
  };

}

}
module.exports = GamaDTO;