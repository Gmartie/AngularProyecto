class TipoAnimatronicosDTO {

  static toResponse(tipo) {
    return {
      id: tipo.id,
      nombre: tipo.nombre,
      id_local: tipo.id_local
    };
  }

}

module.exports = TipoAnimatronicosDTO;