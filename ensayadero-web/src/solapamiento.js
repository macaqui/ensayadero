// Lo mismo que el POC para los horarios en resumen

function haySolapamiento(reservaNueva, reservaExistente) {
  const inicioNuevo = new Date(reservaNueva.inicio);
  const finNuevo = new Date(reservaNueva.fin);
  const inicioExistente = new Date(reservaExistente.inicio);
  const finExistente = new Date(reservaExistente.fin);

  if (inicioNuevo < finExistente && finNuevo > inicioExistente) {
    return true;
  } else {
    return false;
  }
}

export { haySolapamiento };
