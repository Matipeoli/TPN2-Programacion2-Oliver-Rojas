const { enviarRespuesta } = require('../utils/respuesta');
const coberturaService = require('../services/coberturaService');

async function listarCoberturas(req, res) {
  const filas = await coberturaService.listarCoberturas();
  return enviarRespuesta(res, 200, 'ok', filas);
}

module.exports = { listarCoberturas };