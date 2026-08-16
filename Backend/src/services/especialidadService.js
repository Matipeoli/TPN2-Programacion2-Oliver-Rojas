const especialidadRepository = require('../repositories/especialidadRepository');
const { AppError } = require('../utils/errores');
const { validarLongitud } = require('../utils/validaciones');

async function listar() {
  return especialidadRepository.listar();
}

async function crear(datos) {
  const { descripcion } = datos;

  if (!descripcion) {
    throw new AppError(400, 'Faltan datos obligatorios: descripcion');
  }
  validarLongitud('descripcion', descripcion, 30);

  const id = await especialidadRepository.crear({ descripcion });
  return { id, descripcion };
}

async function actualizar(id, datos) {
  const { descripcion } = datos;

  if (!descripcion) {
    throw new AppError(400, 'Faltan datos obligatorios: descripcion');
  }
  validarLongitud('descripcion', descripcion, 30);

  const existe = await especialidadRepository.buscarPorId(id);
  if (!existe) {
    throw new AppError(404, 'La especialidad no existe');
  }

  await especialidadRepository.actualizar(id, { descripcion });
  return { id: Number(id), descripcion };
}

async function eliminar(id) {
  const existe = await especialidadRepository.buscarPorId(id);
  if (!existe) {
    throw new AppError(404, 'La especialidad no existe');
  }

  const tieneMedico = await especialidadRepository.tieneMedicoAsociado(id);
  if (tieneMedico) {
    throw new AppError(409, 'No se puede eliminar la especialidad porque tiene medicos asociados');
  }

  await especialidadRepository.eliminar(id);
  return { id: Number(id) };
}

module.exports = { listar, crear, actualizar, eliminar };