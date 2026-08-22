const { enviarRespuesta } = require('../utils/respuesta');
const notificacionService = require('../services/notificacionService');

async function listar(req, res) {
  const filas = await notificacionService.listar(req.usuario);
  return enviarRespuesta(res, 200, 'ok', filas);
}

async function marcarLeida(req, res) {
  const datos = await notificacionService.marcarLeida(req.params.id, req.usuario);
  return enviarRespuesta(res, 200, 'ok', datos);
}

module.exports = { listar, marcarLeida };
