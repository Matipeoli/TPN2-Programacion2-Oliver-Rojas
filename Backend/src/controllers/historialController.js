const { enviarRespuesta } = require('../utils/respuesta');
const historialService = require('../services/historialService');

async function crear(req, res) {
  const datos = await historialService.crear(req.body, req.usuario);
  return enviarRespuesta(res, 201, 'ok', datos);
}

async function consultarPorPaciente(req, res) {
  const filas = await historialService.consultarPorPaciente(req.params.id_paciente, req.usuario);
  return enviarRespuesta(res, 200, 'ok', filas);
}

module.exports = { crear, consultarPorPaciente };