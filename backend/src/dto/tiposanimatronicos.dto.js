class AnimatronicosDTO {

  static toResponse(animatronico) {
    return {
      id: animatronico.id,
      nombre: animatronico.nombre,
      reconocimiento: animatronico.reconocimiento,
      num_piezas: animatronico.num_piezas,
      id_gama: animatronico.id_gama,
      planos: animatronico.planos,
      foto: animatronico.foto
    };
  }

}

module.exports = AnimatronicosDTO;