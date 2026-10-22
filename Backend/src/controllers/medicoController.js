const { enviarRespuesta } = require('../utils/respuesta');
const medicoService = require('../services/medicoService');

async function listar(req, res) {
  const filas = await medicoService.listar(req.query);
  return enviarRespuesta(res, 200, 'ok', filas);
}

module.exports = { listar };
