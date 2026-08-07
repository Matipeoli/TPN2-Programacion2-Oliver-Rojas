const jwt = require('jsonwebtoken');
const { enviarRespuesta } = require('../utils/respuesta');

function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return enviarRespuesta(res, 401, 'Token no provisto');
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) {
      return enviarRespuesta(res, 401, 'Token invalido o vencido');
    }
    req.usuario = payload;
    next();
  });
}

function verificarRol(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
      return enviarRespuesta(res, 403, 'No tiene permisos para acceder a este recurso');
    }
    next();
  };
}

module.exports = { verificarToken, verificarRol };
