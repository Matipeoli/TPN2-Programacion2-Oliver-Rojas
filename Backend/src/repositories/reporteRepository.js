const pool = require('../database/db');

function agregarRangoFechas(condiciones, parametros, filtros, alias) {
  if (filtros.fecha_desde) {
    condiciones.push(`${alias}.fecha >= ?`);
    parametros.push(filtros.fecha_desde);
  }
  if (filtros.fecha_hasta) {
    condiciones.push(`${alias}.fecha <= ?`);
    parametros.push(filtros.fecha_hasta);
  }
}

async function buscarPorEspecialidad(filtros) {
  let sql = `
    SELECT e.id, e.descripcion, COUNT(*) AS cantidad
    FROM turno t
    JOIN agenda a ON t.id_agenda = a.id
    JOIN especialidad e ON a.id_especialidad = e.id
  `;
  const condiciones = [];
  const parametros = [];
  agregarRangoFechas(condiciones, parametros, filtros, 't');

  if (condiciones.length > 0) {
    sql += ' WHERE ' + condiciones.join(' AND ');
  }
  sql += ' GROUP BY e.id, e.descripcion ORDER BY cantidad DESC';

  const [filas] = await pool.query(sql, parametros);
  return filas;
}

async function turnosPorSede(filtros) {
  let sql = `
    SELECT s.id, s.nombre, COUNT(*) AS cantidad
    FROM turno t
    JOIN agenda a ON t.id_agenda = a.id
    JOIN sede s ON a.id_sede = s.id
  `;
  const condiciones = [];
  const parametros = [];
  agregarRangoFechas(condiciones, parametros, filtros, 't');

  if (condiciones.length > 0) {
    sql += ' WHERE ' + condiciones.join(' AND ');
  }
  sql += ' GROUP BY s.id, s.nombre ORDER BY cantidad DESC';

  const [filas] = await pool.query(sql, parametros);
  return filas;
}

async function rankingMedicos(filtros) {
  let sql = `
    SELECT u.id, u.nombre, u.apellido, COUNT(*) AS cantidad_atendidos
    FROM turno t
    JOIN agenda a ON t.id_agenda = a.id
    JOIN usuario u ON a.id_medico = u.id
    WHERE t.estado = 'atendido'
  `;
  const condiciones = [];
  const parametros = [];
  agregarRangoFechas(condiciones, parametros, filtros, 't');

  if (condiciones.length > 0) {
    sql += ' AND ' + condiciones.join(' AND ');
  }
  sql += ' GROUP BY u.id, u.nombre, u.apellido ORDER BY cantidad_atendidos DESC';

  const [filas] = await pool.query(sql, parametros);
  return filas;
}

async function buscarPorTotalCancelados(filtros) {
  let sql = `
    SELECT COUNT(*) AS total_turnos,
           COALESCE(SUM(CASE WHEN t.estado = 'cancelado' THEN 1 ELSE 0 END), 0) AS total_cancelados
    FROM turno t
  `;
  const condiciones = [];
  const parametros = [];
  agregarRangoFechas(condiciones, parametros, filtros, 't');

  if (condiciones.length > 0) {
    sql += ' WHERE ' + condiciones.join(' AND ');
  }

  const [filas] = await pool.query(sql, parametros);
  return filas[0];
}

module.exports = { buscarPorEspecialidad, turnosPorSede, rankingMedicos, buscarPorTotalCancelados };