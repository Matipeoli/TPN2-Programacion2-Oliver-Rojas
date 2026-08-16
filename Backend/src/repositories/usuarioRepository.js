const pool = require('../database/db');

async function existePorDniOEmail(dni, email) {
  const [filas] = await pool.query(
    'SELECT id FROM usuario WHERE dni = ? OR email = ?',
    [dni, email]
  );
  return filas.length > 0;
}

async function crear(datos) {
  const [resultado] = await pool.query(
    `INSERT INTO usuario
      (apellido, nombre, fecha_nacimiento, password, rol, email, telefono, dni, id_sede, id_cobertura)
     VALUES (?, ?, ?, ?, 'paciente', ?, ?, ?, ?, ?)`,
    [
      datos.apellido,
      datos.nombre,
      datos.fecha_nacimiento,
      datos.password,
      datos.email,
      datos.telefono || '',
      datos.dni,
      datos.id_sede ?? null,
      datos.id_cobertura
    ]
  );
  return resultado.insertId;
}

async function buscarPorDni(dni) {
  const [filas] = await pool.query(
    'SELECT id, nombre, apellido, email, telefono, password, rol, id_sede, id_cobertura FROM usuario WHERE dni = ?',
    [dni]
  );
  return filas[0] || null;
}

async function buscarPorId(id) {
  const [filas] = await pool.query(
    'SELECT id, nombre, apellido, email, telefono, dni, rol, id_sede, id_cobertura FROM usuario WHERE id = ?',
    [id]
  );
  return filas[0] || null;
}

module.exports = { existePorDniOEmail, crear, buscarPorDni, buscarPorId };