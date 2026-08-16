const { enviarRespuesta } = require('../utils/respuesta');
const especialidadService = require('../services/especialidadService');

async function listar(req, res) {
  const filas = await especialidadService.listar();
  return enviarRespuesta(res, 200, 'ok', filas);
}

async function crear(req, res) {
  const datos = await especialidadService.crear(req.body);
  return enviarRespuesta(res, 201, 'ok', datos);
}

async function actualizar(req, res) {
  const datos = await especialidadService.actualizar(req.params.id, req.body);
  return enviarRespuesta(res, 200, 'ok', datos);
}

async function eliminar(req, res) {
  const datos = await especialidadService.eliminar(req.params.id);
  return enviarRespuesta(res, 200, 'ok', datos);
}

module.exports = { listar, crear, actualizar, eliminar };