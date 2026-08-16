const pool = require('../database/db');

async function listar(filtros) {
  let sql = `
    SELECT id, hora_entrada, hora_salida, DATE_FORMAT(fecha, '%Y-%m-%d') AS fecha,
           id_medico, id_especialidad, id_sede
    FROM agenda
  `;
  const condiciones = [];
  const parametros = [];

  if (filtros.id_medico) {
    condiciones.push('id_medico = ?');
    parametros.push(filtros.id_medico);
  }
  if (filtros.id_sede) {
    condiciones.push('id_sede = ?');
    parametros.push(filtros.id_sede);
  }
  if (filtros.fecha) {
    condiciones.push('fecha = ?');
    parametros.push(filtros.fecha);
  }

  if (condiciones.length > 0) {
    sql += ' WHERE ' + condiciones.join(' AND ');
  }
  sql += ' ORDER BY fecha, hora_entrada';

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

module.exports = { listar, buscarPorId, crear, actualizar, eliminar };
