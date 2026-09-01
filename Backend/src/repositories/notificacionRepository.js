const pool = require('../database/db');

async function crear({ id_usuario, tipo, mensaje }) {
  const [resultado] = await pool.query(
    'INSERT INTO notificacion (id_usuario, tipo, mensaje, leida, fecha) VALUES (?, ?, ?, 0, NOW())',
    [id_usuario, tipo, mensaje]
  );
  return resultado.insertId;
}

async function listarPorUsuario(id_usuario) {
  const [filas] = await pool.query(
    'SELECT id, tipo, mensaje, leida, fecha FROM notificacion WHERE id_usuario = ? ORDER BY fecha DESC',
    [id_usuario]
  );
  return filas;
}

async function buscarPorId(id) {
  const [filas] = await pool.query(
    'SELECT id, id_usuario, tipo, mensaje, leida, fecha FROM notificacion WHERE id = ?',
    [id]
  );
  return filas[0] || null;
}

async function marcarLeida(id) {
  const [resultado] = await pool.query(
    'UPDATE notificacion SET leida = 1 WHERE id = ?',
    [id]
  );
  return resultado.affectedRows > 0;
}

module.exports = { crear, listarPorUsuario, buscarPorId, marcarLeida };
