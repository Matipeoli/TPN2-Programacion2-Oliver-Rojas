const { enviarRespuesta } = require('../utils/respuesta');
const usuarioService = require('../services/usuarioService');

async function perfil(req, res) {
  const datos = await usuarioService.perfil(req.usuario);
  return enviarRespuesta(res, 200, 'ok', datos);
}

module.exports = { perfil };