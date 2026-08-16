const { enviarRespuesta } = require('../utils/respuesta');
const agendaService = require('../services/agendaService');

async function listar(req, res) {
  const filas = await agendaService.listar(req.query, req.usuario);
  return enviarRespuesta(res, 200, 'ok', filas);
}

async function crear(req, res) {
  const datos = await agendaService.crear(req.body, req.usuario);
  return enviarRespuesta(res, 201, 'ok', datos);
}

async function actualizar(req, res) {
  const datos = await agendaService.actualizar(req.params.id, req.body, req.usuario);
  return enviarRespuesta(res, 200, 'ok', datos);
}

async function eliminar(req, res) {
  const datos = await agendaService.eliminar(req.params.id, req.usuario);
  return enviarRespuesta(res, 200, 'ok', datos);
}

module.exports = { listar, crear, actualizar, eliminar };
