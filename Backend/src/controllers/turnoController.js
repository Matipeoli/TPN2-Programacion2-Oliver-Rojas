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

module.exports = { crear, cancelar, atender };
