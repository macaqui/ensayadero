// Para probar la regla pa con la API

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

const reservaBase = {
  inicio: '2026-12-01T10:00:00',
  fin: '2026-12-01T12:00:00'
};

const casos = [
  { numero: 1, inicio: '2026-12-01T08:00:00', fin: '2026-12-01T09:00:00', esperado: false },
  { numero: 2, inicio: '2026-12-01T09:00:00', fin: '2026-12-01T10:00:00', esperado: false },
  { numero: 3, inicio: '2026-12-01T09:00:00', fin: '2026-12-01T11:00:00', esperado: true },
  { numero: 4, inicio: '2026-12-01T10:30:00', fin: '2026-12-01T11:30:00', esperado: true },
  { numero: 5, inicio: '2026-12-01T11:00:00', fin: '2026-12-01T13:00:00', esperado: true },
  { numero: 6, inicio: '2026-12-01T09:00:00', fin: '2026-12-01T13:00:00', esperado: true },
  { numero: 7, inicio: '2026-12-01T10:00:00', fin: '2026-12-01T12:00:00', esperado: true },
  { numero: 8, inicio: '2026-12-01T12:00:00', fin: '2026-12-01T13:00:00', esperado: false }
];

for (let indice = 0; indice < casos.length; indice++) {
  const caso = casos[indice];
  const reservaNueva = { inicio: caso.inicio, fin: caso.fin };
  const resultado = haySolapamiento(reservaNueva, reservaBase);

  if (resultado === caso.esperado) {
    console.log('Caso ' + caso.numero + ': OK');
  } else {
    console.log('Caso ' + caso.numero + ': ERROR, esperaba ' + caso.esperado + ' y salió ' + resultado);
  }
}
