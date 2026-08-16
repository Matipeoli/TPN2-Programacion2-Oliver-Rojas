const pool = require('../database/db');

async function listar() {
  const [filas] = await pool.query('SELECT id, nombre, direccion, telefono FROM sede ORDER BY nombre');
  return filas;
}

async function buscarPorId(id) {
  const [filas] = await pool.query('SELECT id, nombre, direccion, telefono FROM sede WHERE id = ?', [id]);
  return filas[0] || null;
}

async function existePorId(id) {
  const [filas] = await pool.query('SELECT id FROM sede WHERE id = ?', [id]);
  return filas.length > 0;
}

async function crear(datos) {
  const [resultado] = await pool.query(
    'INSERT INTO sede (nombre, direccion, telefono) VALUES (?, ?, ?)',
    [datos.nombre, datos.direccion, datos.telefono]
  );
  return resultado.insertId;
}

async function actualizar(id, datos) {
  const [resultado] = await pool.query(
    'UPDATE sede SET nombre = ?, direccion = ?, telefono = ? WHERE id = ?',
    [datos.nombre, datos.direccion, datos.telefono, id]
  );
  return resultado.affectedRows > 0;
}

async function eliminar(id) {
  const [resultado] = await pool.query('DELETE FROM sede WHERE id = ?', [id]);
  return resultado.affectedRows > 0;
}

async function tieneDependencias(id) {
  const [usuarios] = await pool.query('SELECT id FROM usuario WHERE id_sede = ? LIMIT 1', [id]);
  if (usuarios.length > 0) return true;
  const [agendas] = await pool.query('SELECT id FROM agenda WHERE id_sede = ? LIMIT 1', [id]);
  return agendas.length > 0;
}

module.exports = { listar, buscarPorId, existePorId, crear, actualizar, eliminar, tieneDependencias };