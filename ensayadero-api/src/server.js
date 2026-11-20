// API del ensayadero - servidor básico

import express from 'express';
import cors from 'cors';
import prisma from './db.js';

const aplicacion = express();

// Acá revisamos de dónde viene la petición
const configuracionCors = {
  origin: function (origen, contestar) {
    if (origen === 'http://localhost:5173') {
      contestar(null, true);
    } else {
      contestar(null, false);
    }
  }
};

// Esto va antes de las rutas
aplicacion.use(cors(configuracionCors));
aplicacion.use(express.json());

// Revisamos que los datos de la reserva estén completos y bien puestos
function validarReserva(datos) {
  if (!datos.solicitante || datos.solicitante.trim() === '') {
    return 'El solicitante es obligatorio';
  }

  if (!datos.inicio) {
    return 'La hora de inicio es obligatoria';
  }

  if (!datos.fin) {
    return 'La hora de fin es obligatoria';
  }

  if (!datos.instrumentoId) {
    return 'El instrumento es obligatorio';
  }

  const fechaInicio = new Date(datos.inicio);
  const fechaFin = new Date(datos.fin);

  if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
    return 'Las fechas deben ser válidas';
  }

  if (fechaInicio >= fechaFin) {
    return 'La hora de inicio debe ser menor que la de fin';
  }

  return null;
}

// esta cosa es para buscar una reserva que se cruce con el horario que queremos
async function buscarConflicto(instrumentoId, inicio, fin, excluirId, cliente) {
  // Si nos mandan la transacción usamos esa
  let base = prisma;

  if (cliente) {
    base = cliente;
  }

  const donde = {
    instrumentoId: instrumentoId,
    inicio: { lt: fin },
    fin: { gt: inicio }
  };

  if (excluirId) {
    donde.id = { not: excluirId };
  }

  const conflicto = await base.reserva.findFirst({ where: donde });
  return conflicto;
}

// Los instrumentos re facheros
aplicacion.get('/api/instrumentos', async function (peticion, respuesta) {
  const instrumentos = await prisma.instrumento.findMany();
  respuesta.json(instrumentos);
});

// Lo de que podemos reservas por instrumento cucho
aplicacion.get('/api/reservas', async function (peticion, respuesta) {
  const filtro = {};

  if (peticion.query.instrumentoId) {
    filtro.instrumentoId = Number(peticion.query.instrumentoId);
  }

  const reservas = await prisma.reserva.findMany({
    where: filtro,
    orderBy: { inicio: 'asc' },
    include: { instrumento: true }
  });

  respuesta.json(reservas);
});

// Una reserva para cada id como lo pidio
aplicacion.get('/api/reservas/:id', async function (peticion, respuesta) {
  const id = Number(peticion.params.id);
  const reserva = await prisma.reserva.findUnique({ where: { id: id } });

  if (reserva === null) {
    respuesta.status(404).json({ error: 'No se encontró esa reserva' });
  } else {
    respuesta.json(reserva);
  }
});

// La ruta pa crear una reserva
aplicacion.post('/api/reservas', async function (peticion, respuesta) {
  const error = validarReserva(peticion.body);

  if (error !== null) {
    respuesta.status(400).json({ error: error });
    return;
  }

  const instrumentoId = Number(peticion.body.instrumentoId);
  const fechaInicio = new Date(peticion.body.inicio);
  const fechaFin = new Date(peticion.body.fin);

  // Si el id no es número tampoco lo dejamos pasar
  if (Number.isNaN(instrumentoId)) {
    respuesta.status(400).json({ error: 'El instrumento no es válido' });
    return;
  }

  // Esta cosa es para verificar si el instrumento existe
  const instrumento = await prisma.instrumento.findUnique({ where: { id: instrumentoId } });

  if (instrumento === null) {
    respuesta.status(400).json({ error: 'Ese instrumento no existe' });
    return;
  }

  try {
    // Sirve para que las dos funcionen juntan para que ninguna se adelante pa
    const resultado = await prisma.$transaction(async function (tx) {
      const conflicto = await buscarConflicto(instrumentoId, fechaInicio, fechaFin, null, tx);

      if (conflicto !== null) {
        return { conflicto: conflicto };
      }

      const reservaNueva = await tx.reserva.create({
        data: {
          solicitante: peticion.body.solicitante.trim(),
          inicio: fechaInicio,
          fin: fechaFin,
          instrumentoId: instrumentoId
        }
      });

      return { reserva: reservaNueva };
    });

    // Si ya está ocupado mandamos el 409
    if (resultado.conflicto) {
      respuesta.status(409).json({ error: 'Horario ocupado', conflicto: resultado.conflicto });
    } else {
      respuesta.status(201).json(resultado.reserva);
    }
  } catch (errorServidor) {
    respuesta.status(500).json({ error: 'No se pudo crear la reserva' });
  }
});

// La ruta pa cambiar una reserva
aplicacion.put('/api/reservas/:id', async function (peticion, respuesta) {
  const error = validarReserva(peticion.body);

  if (error !== null) {
    respuesta.status(400).json({ error: error });
    return;
  }

  const id = Number(peticion.params.id);
  const instrumentoId = Number(peticion.body.instrumentoId);
  const fechaInicio = new Date(peticion.body.inicio);
  const fechaFin = new Date(peticion.body.fin);

  // Si el id no es número tampoco lo dejamos pasar
  if (Number.isNaN(id) || Number.isNaN(instrumentoId)) {
    respuesta.status(400).json({ error: 'El id no es válido' });
    return;
  }

  try {
    // Primero vemos si la reserva existe
    const reservaActual = await prisma.reserva.findUnique({ where: { id: id } });

    if (reservaActual === null) {
      respuesta.status(404).json({ error: 'No se encontró esa reserva' });
      return;
    }

    // Miramos que el instrumento siga existiendo
    const instrumento = await prisma.instrumento.findUnique({ where: { id: instrumentoId } });

    if (instrumento === null) {
      respuesta.status(400).json({ error: 'Ese instrumento no existe' });
      return;
    }

    // Igual que el POST, todo junto pa que no se cuele otra
    const resultado = await prisma.$transaction(async function (tx) {
      const conflicto = await buscarConflicto(instrumentoId, fechaInicio, fechaFin, id, tx);

      if (conflicto !== null) {
        return { conflicto: conflicto };
      }

      const reservaCambiada = await tx.reserva.update({
        where: { id: id },
        data: {
          solicitante: peticion.body.solicitante.trim(),
          inicio: fechaInicio,
          fin: fechaFin,
          instrumentoId: instrumentoId
        }
      });

      return { reserva: reservaCambiada };
    });

    // Si ya está ocupado mandamos el 409
    if (resultado.conflicto) {
      respuesta.status(409).json({ error: 'Horario ocupado', conflicto: resultado.conflicto });
    } else {
      respuesta.json(resultado.reserva);
    }
  } catch (errorServidor) {
    respuesta.status(500).json({ error: 'No se pudo cambiar la reserva' });
  }
});

// Esta cosa es la ruta para borrar una reserva
aplicacion.delete('/api/reservas/:id', async function (peticion, respuesta) {
  const id = Number(peticion.params.id);

  // el id debe ser un numero o paila
  if (Number.isNaN(id)) {
    respuesta.status(404).json({ error: 'No se encontró esa reserva' });
    return;
  }

  try {
    await prisma.reserva.delete({ where: { id: id } });
    respuesta.status(204).send();
  } catch (errorServidor) {
    // Si Prisma dice P2025 es que no existía
    if (errorServidor.code === 'P2025') {
      respuesta.status(404).json({ error: 'No se encontró esa reserva' });
    } else {
      respuesta.status(500).json({ error: 'No se pudo borrar la reserva' });
    }
  }
});
// Ruta para la prueba pa: si esto responde, el servidor está bien
aplicacion.get('/api/salud', function (peticion, respuesta) {
  respuesta.json({ estado: 'ok' });
});

// El puerto 3000
aplicacion.listen(3000, function () {
  console.log('API en http://localhost:3000');
});
