const sedeRepository = require('../repositories/sedeRepository');
const { AppError } = require('../utils/errores');
const { validarLongitud } = require('../utils/validaciones');

async function listar() {
  return sedeRepository.listar();
}

async function crear(datos) {
  const { nombre, direccion, telefono } = datos;

  if (!nombre || !direccion || !telefono) {
    throw new AppError(400, 'Faltan datos obligatorios: nombre, direccion, telefono');
  }
  validarLongitud('nombre', nombre, 50);
  validarLongitud('direccion', direccion, 100);
  validarLongitud('telefono', telefono, 15);

  const id = await sedeRepository.crear({ nombre, direccion, telefono });
  return { id, nombre, direccion, telefono };
}

async function actualizar(id, datos) {
  const { nombre, direccion, telefono } = datos;

  if (!nombre || !direccion || !telefono) {
    throw new AppError(400, 'Faltan datos obligatorios: nombre, direccion, telefono');
  }
  validarLongitud('nombre', nombre, 50);
  validarLongitud('direccion', direccion, 100);
  validarLongitud('telefono', telefono, 15);

  const existe = await sedeRepository.buscarPorId(id);
  if (!existe) {
    throw new AppError(404, 'La sede no existe');
  }

  await sedeRepository.actualizar(id, { nombre, direccion, telefono });
  return { id: Number(id), nombre, direccion, telefono };
}

async function eliminar(id) {
  const existe = await sedeRepository.buscarPorId(id);
  if (!existe) {
    throw new AppError(404, 'La sede no existe');
  }

  const tieneDependencias = await sedeRepository.tieneDependencias(id);
  if (tieneDependencias) {
    throw new AppError(409, 'No se puede eliminar la sede porque tiene usuarios o agenda asociada');
  }

  await sedeRepository.eliminar(id);
  return { id: Number(id) };
}

module.exports = { listar, crear, actualizar, eliminar };