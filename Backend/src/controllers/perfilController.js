const { enviarRespuesta } = require('../utils/respuesta');


async function perfil(req, res) {
  return enviarRespuesta(res, 200, 'ok', req.usuario);
}

module.exports = { perfil };