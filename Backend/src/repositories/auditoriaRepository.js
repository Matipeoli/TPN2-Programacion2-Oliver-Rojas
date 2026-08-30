const pool = require('../database/db');

async function registrar(idUsuario, accion, entidad, idEntidad, detalle) {
  const [resultado] = await pool.query(
    'INSERT INTO log_auditoria (id_usuario, accion, entidad, id_entidad, detalle) VALUES (?, ?, ?, ?, ?)',
    [idUsuario, accion, entidad, idEntidad ?? null, detalle ?? null]
  );
  return resultado.insertId;
}

async function listar(filtros) {
  let sql = `
    SELECT l.id, l.id_usuario, l.accion, l.entidad, l.id_entidad, l.detalle,
           DATE_FORMAT(l.fecha, '%Y-%m-%d %H:%i:%s') AS fecha,
           CONCAT(u.apellido, ', ', u.nombre) AS nombre_usuario
    FROM log_auditoria l
    LEFT JOIN usuario u ON u.id = l.id_usuario
  `;
  const condiciones = [];
  const parametros = [];

  if (filtros.id_usuario) {
    condiciones.push('l.id_usuario = ?');
    parametros.push(filtros.id_usuario);
  }
  if (filtros.entidad) {
    condiciones.push('l.entidad = ?');
    parametros.push(filtros.entidad);
  }
  if (filtros.fecha_desde) {
    condiciones.push('l.fecha >= ?');
    parametros.push(filtros.fecha_desde + ' 00:00:00');
  }
  if (filtros.fecha_hasta) {
    condiciones.push('l.fecha <= ?');
    parametros.push(filtros.fecha_hasta + ' 23:59:59');
  }

  if (condiciones.length > 0) {
    sql += ' WHERE ' + condiciones.join(' AND ');
  }
  sql += ' ORDER BY l.fecha DESC, l.id DESC';

  const [filas] = await pool.query(sql, parametros);
  return filas;
}

module.exports = { registrar, listar };
