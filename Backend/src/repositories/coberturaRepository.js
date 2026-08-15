const pool = require('../database/db');

async function listar() {
  const [filas] = await pool.query('SELECT id, nombre FROM cobertura ORDER BY nombre');
  return filas;
}

async function existePorId(id) {
  const [filas] = await pool.query('SELECT id FROM cobertura WHERE id = ?', [id]);
  return filas.length > 0;
}

module.exports = { listar, existePorId };