const pool = require('../database/db');

async function listar(filtros) {
  let sql = `
    SELECT a.id, a.hora_entrada, a.hora_salida, DATE_FORMAT(a.fecha, '%Y-%m-%d') AS fecha,
           a.id_medico, a.id_especialidad, a.id_sede,
           m.nombre AS medico_nombre, m.apellido AS medico_apellido,
           e.descripcion AS especialidad, s.nombre AS sede
    FROM agenda a
    JOIN usuario m ON m.id = a.id_medico
    JOIN especialidad e ON e.id = a.id_especialidad
    JOIN sede s ON s.id = a.id_sede
  `;
  const condiciones = [];
  const parametros = [];

  if (filtros.id_medico) {
    condiciones.push('a.id_medico = ?');
    parametros.push(filtros.id_medico);
  }
  if (filtros.id_sede) {
    condiciones.push('a.id_sede = ?');
    parametros.push(filtros.id_sede);
  }
  if (filtros.fecha) {
    condiciones.push('a.fecha = ?');
    parametros.push(filtros.fecha);
  }

  if (condiciones.length > 0) {
    sql += ' WHERE ' + condiciones.join(' AND ');
  }
  sql += ' ORDER BY a.fecha, a.hora_entrada';

  const [filas] = await pool.query(sql, parametros);
  return filas;
}

async function buscarPorId(id) {
  const [filas] = await pool.query(
    `SELECT id, hora_entrada, hora_salida, DATE_FORMAT(fecha, '%Y-%m-%d') AS fecha,
            id_medico, id_especialidad, id_sede
     FROM agenda WHERE id = ?`,
    [id]
  );
  return filas[0] || null;
}

async function crear(datos) {
  const [resultado] = await pool.query(
    'INSERT INTO agenda (hora_entrada, hora_salida, fecha, id_medico, id_especialidad, id_sede) VALUES (?, ?, ?, ?, ?, ?)',
    [datos.hora_entrada, datos.hora_salida, datos.fecha, datos.id_medico, datos.id_especialidad, datos.id_sede]
  );
  return resultado.insertId;
}

async function actualizar(id, datos) {
  const [resultado] = await pool.query(
    'UPDATE agenda SET hora_entrada = ?, hora_salida = ?, fecha = ?, id_medico = ?, id_especialidad = ?, id_sede = ? WHERE id = ?',
    [datos.hora_entrada, datos.hora_salida, datos.fecha, datos.id_medico, datos.id_especialidad, datos.id_sede, id]
  );
  return resultado.affectedRows > 0;
}

async function eliminar(id) {
  const [resultado] = await pool.query('DELETE FROM agenda WHERE id = ?', [id]);
  return resultado.affectedRows > 0;
}

async function listarTurnos(idAgenda) {
  const [filas] = await pool.query(
    `SELECT id, DATE_FORMAT(fecha, '%Y-%m-%d') AS fecha, hora, estado
     FROM turno
     WHERE id_agenda = ?`,
    [idAgenda]
  );
  return filas;
}

module.exports = { listar, buscarPorId, crear, actualizar, eliminar, listarTurnos };
