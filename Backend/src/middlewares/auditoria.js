const auditoriaService = require('../services/auditoriaService');

const ACCION_POR_METODO = {
  POST: 'ALTA',
  PUT: 'MODIFICACION',
  PATCH: 'MODIFICACION',
  DELETE: 'BAJA'
};

function accionDesdeMetodo(metodo) {
  return ACCION_POR_METODO[metodo] || null;
}

function detalleDesdeRespuesta(body, accion) {
  if (!body || body.codigo === undefined) {
    return JSON.stringify(body ?? {});
  }
  const datos = body.datos;
  if (accion === 'ALTA' && datos && datos.id !== undefined) {
    return `Nuevo registro creado con id ${datos.id}`;
  }
  if (accion === 'BAJA' && datos && datos.id !== undefined) {
    return `Registro eliminado con id ${datos.id}`;
  }
  return JSON.stringify(datos ?? {});
}

function idEntidadDesdeRespuesta(body, accion, req) {
  if (accion === 'ALTA') {
    return body && body.datos && body.datos.id !== undefined ? body.datos.id : null;
  }
  if (accion === 'BAJA' || accion === 'MODIFICACION') {
    return req.params.id !== undefined ? req.params.id : null;
  }
  return null;
}

function registrarAuditoria(entidad, opciones = {}) {
  return (req, res, next) => {
    const accion = accionDesdeMetodo(req.method);
    if (!accion) {
      return next();
    }

    const jsonOriginal = res.json.bind(res);
    res.json = (body) => {
      const idUsuario = opciones.idUsuario
        ? opciones.idUsuario(req, res, body)
        : (req.usuario && req.usuario.id) || null;

      const entidadPadre = opciones.nombreEntidad || entidad;

      auditoriaService
        .registrar(
          idUsuario,
          accion,
          entidadPadre,
          idEntidadDesdeRespuesta(body, accion, req),
          detalleDesdeRespuesta(body, accion)
        )
        .catch((err) => console.error('No se pudo registrar la auditoria:', err));

      return jsonOriginal(body);
    };

    next();
  };
}

module.exports = { registrarAuditoria };
