const agendaRepository = require('../repositories/agendaRepository');
const usuarioRepository = require('../repositories/usuarioRepository');
const especialidadRepository = require('../repositories/especialidadRepository');
const sedeRepository = require('../repositories/sedeRepository');
const { AppError } = require('../utils/errores');
const { validarFormatoFecha, validarFormatoHora } = require('../utils/validaciones');

async function listar(filtros, usuario) {
  let { id_medico, id_sede, fecha } = filtros;

  if (usuario.rol === 'medico') {
    if (id_medico !== undefined && id_medico !== null && Number(id_medico) !== usuario.id) {
      throw new AppError(403, 'No tiene permisos para consultar la agenda de otro medico');
    }
    id_medico = usuario.id;
  }

  if (fecha) {
    validarFormatoFecha(fecha, 'fecha');
  }

  return agendaRepository.listar({ id_medico, id_sede, fecha });
}

async function crear(datos, usuario) {
  const { hora_entrada, hora_salida, fecha, id_medico, id_especialidad, id_sede } = datos;

  if (!hora_entrada || !hora_salida || !fecha || !id_especialidad || !id_sede) {
    throw new AppError(400, 'Faltan datos obligatorios: hora_entrada, hora_salida, fecha, id_especialidad, id_sede');
  }

  let idMedico = id_medico;
  if (usuario.rol === 'medico') {
    if (id_medico !== undefined && id_medico !== null && Number(id_medico) !== usuario.id) {
      throw new AppError(403, 'No tiene permisos para gestionar la agenda de otro medico');
    }
    idMedico = usuario.id;
  } else if (!idMedico) {
    throw new AppError(400, 'Faltan datos obligatorios: id_medico');
  }

  validarFormatoFecha(fecha, 'fecha');
  validarFormatoHora(hora_entrada, 'hora_entrada');
  validarFormatoHora(hora_salida, 'hora_salida');

  const hayMedico = await usuarioRepository.buscarPorId(idMedico);
  if (!hayMedico) {
    throw new AppError(400, 'El medico indicado no existe');
  }

  const hayEspecialidad = await especialidadRepository.existePorId(id_especialidad);
  if (!hayEspecialidad) {
    throw new AppError(400, 'La especialidad indicada no existe');
  }

  const haySede = await sedeRepository.existePorId(id_sede);
  if (!haySede) {
    throw new AppError(400, 'La sede indicada no existe');
  }

  const id = await agendaRepository.crear({
    hora_entrada,
    hora_salida,
    fecha,
    id_medico: idMedico,
    id_especialidad,
    id_sede
  });

  return {
    id,
    hora_entrada,
    hora_salida,
    fecha,
    id_medico: Number(idMedico),
    id_especialidad: Number(id_especialidad),
    id_sede: Number(id_sede)
  };
}

async function actualizar(id, datos, usuario) {
  const { hora_entrada, hora_salida, fecha, id_medico, id_especialidad, id_sede } = datos;

  if (!hora_entrada || !hora_salida || !fecha || !id_especialidad || !id_sede) {
    throw new AppError(400, 'Faltan datos obligatorios: hora_entrada, hora_salida, fecha, id_especialidad, id_sede');
  }

  const existe = await agendaRepository.buscarPorId(id);
  if (!existe) {
    throw new AppError(404, 'El turno de agenda no existe');
  }

  let idMedico = id_medico;
  if (usuario.rol === 'medico') {
    if (Number(existe.id_medico) !== usuario.id) {
      throw new AppError(403, 'No tiene permisos para gestionar la agenda de otro medico');
    }
    idMedico = usuario.id;
  } else if (!idMedico) {
    throw new AppError(400, 'Faltan datos obligatorios: id_medico');
  }

  validarFormatoFecha(fecha, 'fecha');
  validarFormatoHora(hora_entrada, 'hora_entrada');
  validarFormatoHora(hora_salida, 'hora_salida');

  const hayMedico = await usuarioRepository.buscarPorId(idMedico);
  if (!hayMedico) {
    throw new AppError(400, 'El medico indicado no existe');
  }

  const hayEspecialidad = await especialidadRepository.existePorId(id_especialidad);
  if (!hayEspecialidad) {
    throw new AppError(400, 'La especialidad indicada no existe');
  }

  const haySede = await sedeRepository.existePorId(id_sede);
  if (!haySede) {
    throw new AppError(400, 'La sede indicada no existe');
  }

  await agendaRepository.actualizar(id, {
    hora_entrada,
    hora_salida,
    fecha,
    id_medico: idMedico,
    id_especialidad,
    id_sede
  });

  return {
    id: Number(id),
    hora_entrada,
    hora_salida,
    fecha,
    id_medico: Number(idMedico),
    id_especialidad: Number(id_especialidad),
    id_sede: Number(id_sede)
  };
}

async function eliminar(id, usuario) {
  const existe = await agendaRepository.buscarPorId(id);
  if (!existe) {
    throw new AppError(404, 'El turno de agenda no existe');
  }

  if (usuario.rol === 'medico' && Number(existe.id_medico) !== usuario.id) {
    throw new AppError(403, 'No tiene permisos para eliminar la agenda de otro medico');
  }

  await agendaRepository.eliminar(id);
  return { id: Number(id) };
}

module.exports = { listar, crear, actualizar, eliminar };
