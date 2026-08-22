const notificacionRepository = require('../repositories/notificacionRepository');
const { AppError } = require('../utils/errores');

async function crear({ id_usuario, tipo, mensaje }) {
  return notificacionRepository.crear({ id_usuario, tipo, mensaje });
}

async function listar(usuario) {
  return notificacionRepository.listarPorUsuario(usuario.id);
}

async function marcarLeida(id, usuario) {
  const notif = await notificacionRepository.buscarPorId(id);
  if (!notif) {
    throw new AppError(404, 'La notificacion no existe');
  }

  if (Number(notif.id_usuario) !== usuario.id) {
    throw new AppError(403, 'No tiene permisos para modificar esta notificacion');
  }

  await notificacionRepository.marcarLeida(id);
  return { id: Number(id), leida: 1 };
}

module.exports = { crear, listar, marcarLeida };
