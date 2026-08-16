const coberturaRepository = require('../repositories/coberturaRepository');
const { AppError } = require('../utils/errores');
const { validarLongitud } = require('../utils/validaciones');

async function listarCoberturas() {
  return coberturaRepository.listar();
}

async function crearCobertura(datos) {
  const { nombre } = datos;

  if (!nombre) {
    throw new AppError(400, 'Faltan datos obligatorios: nombre');
  }
  validarLongitud('nombre', nombre, 30);

  const id = await coberturaRepository.crear({ nombre });
  return { id, nombre };
}

async function actualizarCobertura(id, datos) {
  const { nombre } = datos;

  if (!nombre) {
    throw new AppError(400, 'Faltan datos obligatorios: nombre');
  }
  validarLongitud('nombre', nombre, 30);

  const existe = await coberturaRepository.buscarPorId(id);
  if (!existe) {
    throw new AppError(404, 'La cobertura no existe');
  }

  await coberturaRepository.actualizar(id, { nombre });
  return { id: Number(id), nombre };
}

async function eliminarCobertura(id) {
  const existe = await coberturaRepository.buscarPorId(id);
  if (!existe) {
    throw new AppError(404, 'La cobertura no existe');
  }

  const tieneUsuarios = await coberturaRepository.tieneUsuarios(id);
  if (tieneUsuarios) {
    throw new AppError(409, 'No se puede eliminar la cobertura porque tiene usuarios asociados');
  }

  await coberturaRepository.eliminar(id);
  return { id: Number(id) };
}

module.exports = { listarCoberturas, crearCobertura, actualizarCobertura, eliminarCobertura };