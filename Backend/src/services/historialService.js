const historialRepository = require('../repositories/historialRepository');
const turnoRepository = require('../repositories/turnoRepository');
const { AppError } = require('../utils/errores');
const { validarLongitud } = require('../utils/validaciones');

async function crear(datos, usuario) {
  const { id_turno, diagnostico, tratamiento, observaciones } = datos;

  if (!id_turno || !diagnostico) {
    throw new AppError(400, 'Faltan datos obligatorios: id_turno, diagnostico');
  }

  validarLongitud('diagnostico', diagnostico, 255);
  validarLongitud('tratamiento', tratamiento, 255);
  validarLongitud('observaciones', observaciones, 255);

  const turno = await turnoRepository.buscarPorId(id_turno);
  if (!turno) {
    throw new AppError(404, 'El turno no existe');
  }

  if (turno.estado !== 'atendido') {
    throw new AppError(400, 'Solo se puede registrar historial de turnos en estado atendido');
  }

  if (Number(turno.id_medico) !== usuario.id) {
    throw new AppError(403, 'No tiene permisos para registrar historial de un turno que no atendio');
  }

  const yaExiste = await historialRepository.existePorTurno(id_turno);
  if (yaExiste) {
    throw new AppError(409, 'Ya existe un registro de historial para este turno');
  }

  const id = await historialRepository.crear({
    id_turno,
    id_medico: usuario.id,
    id_paciente: turno.id_paciente,
    diagnostico,
    tratamiento: tratamiento || null,
    observaciones: observaciones || null
  });

  return {
    id,
    id_turno: Number(id_turno),
    id_medico: usuario.id,
    id_paciente: Number(turno.id_paciente),
    diagnostico,
    tratamiento: tratamiento || null,
    observaciones: observaciones || null
  };
}

async function consultarPorPaciente(idPaciente, usuario) {
  if (!idPaciente) {
    throw new AppError(400, 'Falta el parametro obligatorio: id_paciente');
  }

  if (usuario.rol === 'paciente') {
    if (Number(idPaciente) !== usuario.id) {
      throw new AppError(403, 'No tiene permisos para consultar el historial de otro paciente');
    }
    return historialRepository.listarPorPaciente(usuario.id);
  }

  return historialRepository.listarPorPaciente(Number(idPaciente), usuario.id);
}

module.exports = { crear, consultarPorPaciente };