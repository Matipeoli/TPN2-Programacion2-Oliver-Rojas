const auditoriaRepository = require('../repositories/auditoriaRepository');
const { AppError } = require('../utils/errores');
const { validarFormatoFecha } = require('../utils/validaciones');

const ACCIONES_PERMITIDAS = ['ALTA', 'BAJA', 'MODIFICACION'];

async function registrar(idUsuario, accion, entidad, idEntidad, detalle) {
  if (!ACCIONES_PERMITIDAS.includes(accion)) {
    throw new AppError(500, 'Accion de auditoria invalida');
  }
  if (!entidad) {
    throw new AppError(500, 'Entidad de auditoria obligatoria');
  }
  return auditoriaRepository.registrar(idUsuario, accion, entidad, idEntidad, detalle);
}

async function listar(filtros) {
  const { id_usuario, entidad, fecha_desde, fecha_hasta } = filtros;

  if (fecha_desde) {
    validarFormatoFecha(fecha_desde, 'fecha_desde');
  }
  if (fecha_hasta) {
    validarFormatoFecha(fecha_hasta, 'fecha_hasta');
  }

  return auditoriaRepository.listar({
    id_usuario,
    entidad,
    fecha_desde,
    fecha_hasta
  });
}

module.exports = { registrar, listar };
