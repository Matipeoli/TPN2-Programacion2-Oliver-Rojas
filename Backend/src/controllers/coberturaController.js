const pool = require('../database/db');
const { enviarRespuesta } = require('../utils/respuesta');

async function listarCoberturas(req, res) {
  try {
    const [filas] = await pool.query('SELECT id, nombre FROM cobertura ORDER BY nombre');
    return enviarRespuesta(res, 200, 'ok', filas);
  } catch (error) {
    console.error(error);
    return enviarRespuesta(res, 500, 'Error interno al obtener las coberturas');
  }
}

module.exports = { listarCoberturas };