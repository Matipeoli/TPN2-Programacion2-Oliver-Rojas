const { enviarRespuesta } = require('../utils/respuesta');
const reporteService = require('../services/reporteService');

async function turnosPorEspecialidad(req, res) {
  const filas = await reporteService.turnosPorEspecialidad(req.query);
  return enviarRespuesta(res, 200, 'ok', filas);
}

async function turnosPorSede(req, res) {
  const filas = await reporteService.turnosPorSede(req.query);
  return enviarRespuesta(res, 200, 'ok', filas);
}

async function rankingMedicos(req, res) {
  const filas = await reporteService.rankingMedicos(req.query);
  return enviarRespuesta(res, 200, 'ok', filas);
}

async function tasaCancelacion(req, res) {
  const datos = await reporteService.tasaCancelacion(req.query);
  return enviarRespuesta(res, 200, 'ok', datos);
}

module.exports = { turnosPorEspecialidad, turnosPorSede, rankingMedicos, tasaCancelacion };