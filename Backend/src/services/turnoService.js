const turnoRepository = require('../repositories/turnoRepository');
const usuarioRepository = require('../repositories/usuarioRepository');
const notificacionService = require('./notificacionService');
const { AppError } = require('../utils/errores');
const { validarFormatoFecha, validarFormatoHora } = require('../utils/validaciones');
const { DURACION_TURNO_MINUTOS, horaAMinutos, minutosAHora } = require('../utils/horarios');

function formatoFecha(valor) {
  return new Date(valor).toISOString().slice(0, 10);
}

async function crear(datos, usuario) {
  const { id_especialidad, id_sede, id_medico, fecha, hora, nota, id_paciente } = datos;

  if (!id_especialidad || !id_sede || !id_medico || !fecha || !hora || !nota) {
    throw new AppError(400, 'Faltan datos obligatorios: id_especialidad, id_sede, id_medico, fecha, hora, nota');
  }

  let idPaciente = id_paciente;
  if (usuario.rol === 'paciente') {
    idPaciente = usuario.id;
  } else if (usuario.rol === 'operador') {
    if (!idPaciente) {
      throw new AppError(400, 'Faltan datos obligatorios: id_paciente');
    }
    const paciente = await usuarioRepository.buscarPorId(idPaciente);
    if (!paciente || paciente.rol !== 'paciente') {
      throw new AppError(400, 'El usuario indicado no es un paciente valido');
    }
  }

  validarFormatoFecha(fecha, 'fecha');
  validarFormatoHora(hora, 'hora');

  const agenda = await turnoRepository.buscarAgenda({ id_medico, id_especialidad, id_sede, fecha, hora });
  if (!agenda) {
    throw new AppError(400, 'No existe agenda disponible para el medico, especialidad, sede, fecha y horario indicados');
  }

  if (usuario.rol === 'operador') {
    if (!usuario.id_sede) {
      throw new AppError(403, 'El operador no tiene una sede asignada');
    }
    if (Number(agenda.id_sede) !== Number(usuario.id_sede)) {
      throw new AppError(403, 'No tiene permisos para crear turnos en otra sede');
    }
  }

  const inicioAgenda = horaAMinutos(agenda.hora_entrada);
  const finAgenda = horaAMinutos(agenda.hora_salida);
  const horarioSolicitado = horaAMinutos(hora);

  if (horarioSolicitado < inicioAgenda || horarioSolicitado + DURACION_TURNO_MINUTOS > finAgenda) {
    throw new AppError(400, `El horario solicitado no esta dentro del rango disponible (${agenda.hora_entrada} - ${agenda.hora_salida})`);
  }
  if ((horarioSolicitado - inicioAgenda) % DURACION_TURNO_MINUTOS !== 0) {
    throw new AppError(400, `Los turnos se asignan en bloques de ${DURACION_TURNO_MINUTOS} minutos`);
  }

  const paciente = await usuarioRepository.buscarPorId(idPaciente);
  if (!paciente) {
    throw new AppError(400, 'El paciente indicado no existe');
  }
  if (!paciente.id_cobertura) {
    throw new AppError(400, 'El paciente no tiene cobertura registrada');
  }

  const superpuesto = await turnoRepository.existeSuperposicion(agenda.id, fecha, hora);
  if (superpuesto) {
    throw new AppError(409, 'Ya existe un turno confirmado para ese horario');
  }

  const id = await turnoRepository.crear({
    id_agenda: agenda.id,
    fecha,
    hora,
    id_paciente: idPaciente,
    id_cobertura: paciente.id_cobertura,
    nota,
    estado: 'confirmado'
  });

  await notificacionService.crear({
    id_usuario: idPaciente,
    tipo: 'turno_confirmado',
    mensaje: `Turno confirmado para el ${fecha} a las ${hora}`
  });

  return { id, fecha, hora, id_medico: Number(id_medico), id_especialidad: Number(id_especialidad), id_sede: Number(id_sede), id_paciente: idPaciente, id_cobertura: paciente.id_cobertura, nota, estado: 'confirmado' };
}

async function cancelar(id, usuario) {
  const turno = await turnoRepository.buscarPorId(id);
  if (!turno) {
    throw new AppError(404, 'El turno no existe');
  }

  if (turno.estado !== 'confirmado') {
    throw new AppError(400, 'Solo se pueden cancelar turnos en estado confirmado');
  }

  if (usuario.rol === 'paciente') {
    if (Number(turno.id_paciente) !== usuario.id) {
      throw new AppError(403, 'No tiene permisos para cancelar este turno');
    }
  } else if (usuario.rol === 'operador') {
    if (Number(turno.id_sede) !== Number(usuario.id_sede)) {
      throw new AppError(403, 'No tiene permisos para cancelar turnos de otra sede');
    }
  } else if (usuario.rol === 'medico') {
    if (Number(turno.id_medico) !== Number(usuario.id)) {
      throw new AppError(403, 'No tiene permisos para cancelar este turno');
    }
  }

  await turnoRepository.cambiarEstado(id, 'cancelado');

  await notificacionService.crear({
    id_usuario: turno.id_paciente,
    tipo: 'turno_cancelado',
    mensaje: `Turno cancelado para el ${formatoFecha(turno.fecha)} a las ${turno.hora}`
  });

  return { id: Number(id), estado: 'cancelado' };
}

async function atender(id, usuario) {
  const turno = await turnoRepository.buscarPorId(id);
  if (!turno) {
    throw new AppError(404, 'El turno no existe');
  }

  if (turno.estado !== 'confirmado') {
    throw new AppError(400, 'Solo se pueden atender turnos en estado confirmado');
  }

  if (Number(turno.id_medico) !== usuario.id) {
    throw new AppError(403, 'No tiene permisos para atender este turno');
  }

  await turnoRepository.cambiarEstado(id, 'atendido');

  await notificacionService.crear({
    id_usuario: turno.id_paciente,
    tipo: 'turno_atendido',
    mensaje: `Turno atendido para el ${formatoFecha(turno.fecha)} a las ${turno.hora}`
  });

  return { id: Number(id), estado: 'atendido' };
}

async function listarPorPaciente(usuario) {
  return turnoRepository.listarPorPaciente(usuario.id);
}

async function listarPorMedico(filtros, usuario) {
  const { fecha } = filtros;

  if (!fecha) {
    throw new AppError(400, 'Falta el parametro obligatorio: fecha');
  }
  validarFormatoFecha(fecha, 'fecha');

  return turnoRepository.listarPorMedico(usuario.id, fecha);
}

async function listarPorSede(filtros, usuario) {
  const { fecha } = filtros;

  if (!usuario.id_sede) {
    throw new AppError(403, 'El operador no tiene una sede asignada');
  }
  if (!fecha) {
    throw new AppError(400, 'Falta el parametro obligatorio: fecha');
  }
  validarFormatoFecha(fecha, 'fecha');

  return turnoRepository.listarPorSede(Number(usuario.id_sede), fecha);
}

async function listarFechasDisponibles(filtros) {
  const { id_medico, id_especialidad, id_sede } = filtros;

  if (!id_medico || !id_especialidad || !id_sede) {
    throw new AppError(400, 'Faltan datos obligatorios: id_medico, id_especialidad, id_sede');
  }

  return turnoRepository.listarFechasDisponibles({ id_medico, id_especialidad, id_sede });
}

async function listarHorariosDisponibles(filtros) {
  const { id_medico, id_especialidad, id_sede, fecha } = filtros;

  if (!id_medico || !id_especialidad || !id_sede || !fecha) {
    throw new AppError(400, 'Faltan datos obligatorios: id_medico, id_especialidad, id_sede, fecha');
  }
  validarFormatoFecha(fecha, 'fecha');

  const rangos = await turnoRepository.listarAgendaDelDia({
    id_medico,
    id_especialidad,
    id_sede,
    fecha
  });
  if (rangos.length === 0) {
    return [];
  }

  const ocupadas = await turnoRepository.listarHorasConfirmadas(
    rangos.map((rango) => rango.id),
    fecha
  );
  const horasOcupadas = new Set(ocupadas.map((hora) => String(hora).slice(0, 5)));

  const horarios = new Set();
  for (const rango of rangos) {
    const inicio = horaAMinutos(rango.hora_entrada);
    const fin = horaAMinutos(rango.hora_salida);

    for (let minuto = inicio; minuto + DURACION_TURNO_MINUTOS <= fin; minuto += DURACION_TURNO_MINUTOS) {
      const hora = minutosAHora(minuto);
      if (!horasOcupadas.has(hora)) {
        horarios.add(hora);
      }
    }
  }

  return Array.from(horarios).sort();
}

module.exports = {
  crear,
  cancelar,
  atender,
  listarPorPaciente,
  listarPorMedico,
  listarPorSede,
  listarFechasDisponibles,
  listarHorariosDisponibles
};
