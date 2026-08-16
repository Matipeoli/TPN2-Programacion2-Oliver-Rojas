const pool = require('../database/db');

async function listar() {
  const [filas] = await pool.query('SELECT id, nombre FROM cobertura ORDER BY nombre');
  return filas;
}

async function buscarPorId(id) {
  const [filas] = await pool.query('SELECT id, nombre FROM cobertura WHERE id = ?', [id]);
  return filas[0] || null;
}

async function existePorId(id) {
  const [filas] = await pool.query('SELECT id FROM cobertura WHERE id = ?', [id]);
  return filas.length > 0;
}

async function crear(datos) {
  const [resultado] = await pool.query(
    'INSERT INTO cobertura (nombre) VALUES (?)',
    [datos.nombre]
  );
  return resultado.insertId;
}

async function actualizar(id, datos) {
  const [resultado] = await pool.query(
    'UPDATE cobertura SET nombre = ? WHERE id = ?',
    [datos.nombre, id]
  );
  return resultado.affectedRows > 0;
}

async function eliminar(id) {
  const [resultado] = await pool.query('DELETE FROM cobertura WHERE id = ?', [id]);
  return resultado.affectedRows > 0;
}

async function tieneUsuarios(id) {
  const [filas] = await pool.query(
    'SELECT id FROM usuario WHERE id_cobertura = ? LIMIT 1',
    [id]
  );
  return filas.length > 0;
}

module.exports = { listar, buscarPorId, existePorId, crear, actualizar, eliminar, tieneUsuarios };