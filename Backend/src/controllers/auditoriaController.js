const { enviarRespuesta } = require('../utils/respuesta');
const auditoriaService = require('../services/auditoriaService');

async function listar(req, res) {
  const filas = await auditoriaService.listar(req.query);
  return enviarRespuesta(res, 200, 'ok', filas);
}

module.exports = { listar };
