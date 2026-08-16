const pool = require('../database/db');

async function listar() {
  const [filas] = await pool.query('SELECT id, descripcion FROM especialidad ORDER BY descripcion');
  return filas;
}

async function buscarPorId(id) {
  const [filas] = await pool.query('SELECT id, descripcion FROM especialidad WHERE id = ?', [id]);
  return filas[0] || null;
}

async function existePorId(id) {
  const [filas] = await pool.query('SELECT id FROM especialidad WHERE id = ?', [id]);
  return filas.length > 0;
}

async function crear(datos) {
  const [resultado] = await pool.query(
    'INSERT INTO especialidad (descripcion) VALUES (?)',
    [datos.descripcion]
  );
  return resultado.insertId;
}

async function actualizar(id, datos) {
  const [resultado] = await pool.query(
    'UPDATE especialidad SET descripcion = ? WHERE id = ?',
    [datos.descripcion, id]
  );
  return resultado.affectedRows > 0;
}

async function eliminar(id) {
  const [resultado] = await pool.query('DELETE FROM especialidad WHERE id = ?', [id]);
  return resultado.affectedRows > 0;
}

async function tieneMedicoAsociado(id) {
  const [filas] = await pool.query(
    'SELECT id FROM medico_especialidad WHERE id_especialidad = ? LIMIT 1',
    [id]
  );
  return filas.length > 0;
}

module.exports = { listar, buscarPorId, existePorId, crear, actualizar, eliminar, tieneMedicoAsociado };