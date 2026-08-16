const { enviarRespuesta } = require('../utils/respuesta');
const coberturaService = require('../services/coberturaService');

async function listarCoberturas(req, res) {
  const filas = await coberturaService.listarCoberturas();
  return enviarRespuesta(res, 200, 'ok', filas);
}

async function crearCobertura(req, res) {
  const datos = await coberturaService.crearCobertura(req.body);
  return enviarRespuesta(res, 201, 'ok', datos);
}

async function actualizarCobertura(req, res) {
  const datos = await coberturaService.actualizarCobertura(req.params.id, req.body);
  return enviarRespuesta(res, 200, 'ok', datos);
}

async function eliminarCobertura(req, res) {
  const datos = await coberturaService.eliminarCobertura(req.params.id);
  return enviarRespuesta(res, 200, 'ok', datos);
}

module.exports = { listarCoberturas, crearCobertura, actualizarCobertura, eliminarCobertura };