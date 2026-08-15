const { enviarRespuesta } = require('../utils/respuesta');
const usuarioService = require('../services/usuarioService');

async function registro(req, res) {
  const datos = await usuarioService.registro(req.body);
  return enviarRespuesta(res, 201, 'ok', datos);
}

async function login(req, res) {
  const datos = await usuarioService.login(req.body);
  return enviarRespuesta(res, 200, 'ok', datos);
}

module.exports = { registro, login };