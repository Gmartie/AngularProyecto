class TipoAnimatronicosDTO {
  static toResponse(tipo) {
    return {
      id:     tipo.id,
      nombre: tipo.nombre,
      icono:  tipo.icono || null
    };
  }
}
module.exports = TipoAnimatronicosDTO;
