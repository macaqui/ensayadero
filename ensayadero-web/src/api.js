// La ruta de la API pa hablar con el backend

const URL_BASE = 'http://localhost:3000/api';

// Esto es lo que trae la lista
async function listarInstrumentos() {
  const respuesta = await fetch(URL_BASE + '/instrumentos');

  if (respuesta.ok === false) {
    const datosError = await respuesta.json();
    const errorApi = new Error(datosError.error);
    errorApi.codigo = respuesta.status;
    throw errorApi;
  }

  const instrumentos = await respuesta.json();
  return instrumentos;
}

// para filtrar los instrumentos
async function listarReservas(instrumentoId) {
  const respuesta = await fetch(URL_BASE + '/reservas?instrumentoId=' + instrumentoId);

  if (respuesta.ok === false) {
    const datosError = await respuesta.json();
    const errorApi = new Error(datosError.error);
    errorApi.codigo = respuesta.status;
    throw errorApi;
  }

  const reservas = await respuesta.json();
  return reservas;
}

// mandar el cuerpo en JSON
async function crearReserva(datos) {
  const respuesta = await fetch(URL_BASE + '/reservas', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(datos)
  });

  if (respuesta.ok === false) {
    const datosError = await respuesta.json();
    const errorApi = new Error(datosError.error);
    errorApi.codigo = respuesta.status;
    throw errorApi;
  }

  const reserva = await respuesta.json();
  return reserva;
}

// para borrar una reserva
async function eliminarReserva(id) {
  const respuesta = await fetch(URL_BASE + '/reservas/' + id, {
    method: 'DELETE'
  });

  if (respuesta.ok === false) {
    const datosError = await respuesta.json();
    const errorApi = new Error(datosError.error);
    errorApi.codigo = respuesta.status;
    throw errorApi;
  }
}

// es la id de la reserva
async function actualizarReserva(id, datos) {
  const respuesta = await fetch(URL_BASE + '/reservas/' + id, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(datos)
  });

  if (respuesta.ok === false) {
    const datosError = await respuesta.json();
    const errorApi = new Error(datosError.error);
    errorApi.codigo = respuesta.status;
    throw errorApi;
  }

  const reserva = await respuesta.json();
  return reserva;
}

export { listarInstrumentos, listarReservas, crearReserva, eliminarReserva, actualizarReserva };
