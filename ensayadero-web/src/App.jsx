// empezo lo bonito pa

import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { listarInstrumentos, listarReservas, crearReserva, eliminarReserva } from './api.js';
import { haySolapamiento } from './solapamiento.js';

const localizador = dateFnsLocalizer({
  format: format,
  parse: parse,
  startOfWeek: startOfWeek,
  getDay: getDay,
  locales: { es: es },
  locale: 'es'
});

function App() {
  const [instrumentos, setInstrumentos] = useState([]);
  const [instrumentoSeleccionado, setInstrumentoSeleccionado] = useState(0);
  const [reservas, setReservas] = useState([]);
  const [mensaje, setMensaje] = useState(null);

  // Lo que escribe la persona en el formulario
  const [solicitante, setSolicitante] = useState('');
  const [inicio, setInicio] = useState('');
  const [fin, setFin] = useState('');

  // Cuando abre, trae los instrumentos y deja el primero
  useEffect(function () {
    async function cargarInstrumentos() {
      const datos = await listarInstrumentos();
      setInstrumentos(datos);

      if (datos.length > 0) {
        setInstrumentoSeleccionado(datos[0].id);
      }
    }

    cargarInstrumentos();
  }, []);

  // Cuando cambia de instrumento, trae sus reservas
  useEffect(function () {
    async function cargarReservas() {
      if (instrumentoSeleccionado === 0) {
        return;
      }

      const datos = await listarReservas(instrumentoSeleccionado);
      setReservas(datos);
    }

    cargarReservas();
  }, [instrumentoSeleccionado]);

  // cambiar de instrumento con un clic
  function escogerInstrumento(id) {
    setInstrumentoSeleccionado(id);
  }

  // Para poner bonito el botón que está escogido
  function colorBoton(id) {
    if (id === instrumentoSeleccionado) {
      return '#bde0fe';
    } else {
      return '#eeeeee';
    }
  }

  // para mejorar el calendario 
  function escogerHueco(rango) {
    setInicio(format(rango.start, "yyyy-MM-dd'T'HH:mm"));
    setFin(format(rango.end, "yyyy-MM-dd'T'HH:mm"));
  }

  // sirve para borrar las reservas de forma iz
  async function borrarReserva(evento) {
    const acepta = window.confirm('¿Seguro que quieres borrar la reserva de ' + evento.title + '?');

    if (acepta === false) {
      return;
    }

    try {
      await eliminarReserva(evento.id);

      const actualizadas = await listarReservas(instrumentoSeleccionado);
      setReservas(actualizadas);
      setMensaje({ tipo: 'exito', texto: 'La reserva se borró' });
    } catch (error) {
      setMensaje({ tipo: 'error', texto: error.message });
    }
  }

  // Poner bonito las reservas en el calendario 
  const eventos = reservas.map(function (reserva) {
    return {
      id: reserva.id,
      title: reserva.solicitante,
      start: new Date(reserva.inicio),
      end: new Date(reserva.fin)
    };
  });

  // El nombre del instrumento que está escogido
  const instrumentoActual = instrumentos.find(function (instrumento) {
    return instrumento.id === instrumentoSeleccionado;
  });

  // Revisamos el horario mientras la persona escribe
  function revisarHorario() {
    if (inicio === '' || fin === '') {
      return null;
    }

    const fechaInicio = new Date(inicio);
    const fechaFin = new Date(fin);

    if (fechaInicio >= fechaFin) {
      return 'La hora de inicio debe ser menor que la de fin';
    }

    for (let indice = 0; indice < reservas.length; indice++) {
      const reserva = reservas[indice];

      if (haySolapamiento({ inicio: inicio, fin: fin }, reserva)) {
        return 'Ese horario ya está ocupado de ' + reserva.solicitante +
          ' (' + new Date(reserva.inicio).toLocaleString() +
          ' a ' + new Date(reserva.fin).toLocaleString() + ')';
      }
    }

    return null;
  }

  const errorHorario = revisarHorario();

  // Mandamos la reserva pa que la guarde la API
  async function enviarFormulario(evento) {
    evento.preventDefault();

    // para quue no reviente con campos vacios
    if (inicio === '' || fin === '') {
      setMensaje({ tipo: 'error', texto: 'Llena la hora de inicio y la de fin' });
      return;
    }

    const datos = {
      solicitante: solicitante,
      inicio: new Date(inicio).toISOString(),
      fin: new Date(fin).toISOString(),
      instrumentoId: instrumentoSeleccionado
    };

    try {
      await crearReserva(datos);

      const actualizadas = await listarReservas(instrumentoSeleccionado);
      setReservas(actualizadas);

      setSolicitante('');
      setInicio('');
      setFin('');

      setMensaje({ tipo: 'exito', texto: 'La reserva quedó guardada' });
    } catch (error) {
      setMensaje({ tipo: 'error', texto: error.message });
    }
  }

  // Para colorear el mensaje según sea error o éxito
  function colorMensaje() {
    if (mensaje && mensaje.tipo === 'error') {
      return 'red';
    } else {
      return 'green';
    }
  }

  return (
    <div>
      <h1>Ensayadero musical</h1>

      <div>
        {instrumentos.map(function (instrumento) {
          return (
            <button
              key={instrumento.id}
              onClick={function () {
                escogerInstrumento(instrumento.id);
              }}
              style={{ backgroundColor: colorBoton(instrumento.id), margin: '4px', padding: '8px' }}
            >
              {instrumento.nombre}
            </button>
          );
        })}
      </div>

      <div style={{ height: '600px', marginTop: '20px' }}>
        <Calendar
          localizer={localizador}
          events={eventos}
          views={['week', 'day']}
          defaultView="week"
          culture="es"
          style={{ height: 600 }}
          selectable
          onSelectSlot={escogerHueco}
          onSelectEvent={borrarReserva}
        />
      </div>

      <form onSubmit={enviarFormulario} style={{ marginTop: '20px' }}>
        <div>
          <label>Solicitante: </label>
          <input
            type="text"
            value={solicitante}
            onChange={function (evento) {
              setSolicitante(evento.target.value);
            }}
            required
          />
        </div>

        <div>
          <label>Instrumento: </label>
          <input
            type="text"
            readOnly
            value={instrumentoActual ? instrumentoActual.nombre : ''}
          />
        </div>

        <div>
          <label>Inicio: </label>
          <input
            type="datetime-local"
            value={inicio}
            onChange={function (evento) {
              setInicio(evento.target.value);
            }}
            required
          />
        </div>

        <div>
          <label>Fin: </label>
          <input
            type="datetime-local"
            value={fin}
            onChange={function (evento) {
              setFin(evento.target.value);
            }}
            required
          />
        </div>

        {errorHorario && (
          <p style={{ color: 'red' }}>{errorHorario}</p>
        )}

        <button type="submit" disabled={errorHorario !== null} style={{ marginTop: '10px' }}>
          Solicitar reserva
        </button>
      </form>

      {mensaje && (
        <p style={{ color: colorMensaje() }}>{mensaje.texto}</p>
      )}
    </div>
  );
}

export default App;
