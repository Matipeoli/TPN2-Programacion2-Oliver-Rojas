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
     VALUES (?, ?, ?, ?, 'paciente', ?, ?, ?, NULL, ?)`,
    [
      datos.apellido,
      datos.nombre,
      datos.fecha_nacimiento,
      datos.password,
      datos.email,
      datos.telefono || '',
      datos.dni,
      datos.id_cobertura
    ]
  );
  return resultado.insertId;
}

async function buscarPorDni(dni) {
  const [filas] = await pool.query(
    'SELECT id, nombre, apellido, password, rol, id_sede FROM usuario WHERE dni = ?',
    [dni]
  );
  return filas[0] || null;
}

module.exports = { existePorDniOEmail, crear, buscarPorDni };