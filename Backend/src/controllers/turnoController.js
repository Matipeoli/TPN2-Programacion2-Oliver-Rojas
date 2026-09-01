const { enviarRespuesta } = require('../utils/respuesta');
const turnoService = require('../services/turnoService');

async function crear(req, res) {
  const datos = await turnoService.crear(req.body, req.usuario);
  return enviarRespuesta(res, 201, 'ok', datos);
}

async function cancelar(req, res) {
  const datos = await turnoService.cancelar(req.params.id, req.usuario);
  return enviarRespuesta(res, 200, 'ok', datos);
}

async function atender(req, res) {
  const datos = await turnoService.atender(req.params.id, req.usuario);
  return enviarRespuesta(res, 200, 'ok', datos);
}

async function listarPorPaciente(req, res){
  const filas = await turnoService.listarPorPaciente(req.usuario);
  return enviarRespuesta(res, 200, 'ok', filas);
}

async function listarPorMedico(req, res) {
  const filas = await turnoService.listarPorMedico(req.query, req.usuario);
  return enviarRespuesta(res, 200, 'ok', filas);
}

async function listarPorSede(req, res) {
  const filas = await turnoService.listarPorSede(req.query, req.usuario);
  return enviarRespuesta(res, 200, 'ok', filas);
}

module.exports = { crear, cancelar, atender, listarPorPaciente, listarPorMedico, listarPorSede };
