const { enviarRespuesta } = require('../utils/respuesta');
const usuarioService = require('../services/usuarioService');

async function perfil(req, res) {
  const datos = await usuarioService.perfil(req.usuario.id);
  return enviarRespuesta(res, 200, 'ok', datos);
}

async function actualizarPerfil(req, res) {
  const datos = await usuarioService.actualizarPerfil(req.usuario.id, req.body);
  return enviarRespuesta(res, 200, 'ok', datos);
}

async function buscarPacientes(req, res) {
  const filas = await usuarioService.buscarPacientes(req.query);
  return enviarRespuesta(res, 200, 'ok', filas);
}

async function listarUsuarios(req, res) {
  const datos = await usuarioService.listarUsuarios(req.query);
  return enviarRespuesta(res, 200, 'ok', datos);
}

async function crearUsuario(req, res) {
  const datos = await usuarioService.crearUsuario(req.body);
  return enviarRespuesta(res, 201, 'ok', datos);
}

async function actualizarUsuario(req, res) {
  const datos = await usuarioService.actualizarUsuario(req.params.id, req.body);
  return enviarRespuesta(res, 200, 'ok', datos);
}

module.exports = {
  perfil,
  actualizarPerfil,
  buscarPacientes,
  listarUsuarios,
  crearUsuario,
  actualizarUsuario
};