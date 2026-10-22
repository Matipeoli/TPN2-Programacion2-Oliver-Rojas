const pool = require('../database/db');

const SELECT_USUARIO = `
  SELECT u.id, u.apellido, u.nombre,
         DATE_FORMAT(u.fecha_nacimiento, '%Y-%m-%d') AS fecha_nacimiento,
         u.email, u.telefono, u.dni, u.rol, u.id_sede, s.nombre AS sede,
         u.id_cobertura, c.nombre AS cobertura
  FROM usuario u
  LEFT JOIN sede s ON s.id = u.id_sede
  LEFT JOIN cobertura c ON c.id = u.id_cobertura
`;

async function listarEspecialidadesDeMedicos(idsMedicos) {
  if (idsMedicos.length === 0) {
    return [];
  }
  const [filas] = await pool.query(
    `SELECT me.id_medico, e.id, e.descripcion
     FROM medico_especialidad me
     JOIN especialidad e ON e.id = me.id_especialidad
     WHERE me.id_medico IN (?)
     ORDER BY e.descripcion`,
    [idsMedicos]
  );
  return filas;
}

async function adjuntarEspecialidades(filas) {
  const idsMedicos = filas.filter((fila) => fila.rol === 'medico').map((fila) => fila.id);
  const especialidades = await listarEspecialidadesDeMedicos(idsMedicos);

  for (const fila of filas) {
    fila.especialidades = especialidades
      .filter((especialidad) => especialidad.id_medico === fila.id)
      .map((especialidad) => ({
        id: especialidad.id,
        descripcion: especialidad.descripcion
      }));
  }
}

async function existePorDniOEmail(dni, email) {
  const [filas] = await pool.query(
    'SELECT id FROM usuario WHERE dni = ? OR email = ?',
    [dni, email]
  );
  return filas.length > 0;
}

async function existePorDniOEmailExcepto(dni, email, id) {
  const [filas] = await pool.query(
    'SELECT id FROM usuario WHERE (dni = ? OR email = ?) AND id <> ?',
    [dni, email, id]
  );
  return filas.length > 0;
}

async function existePorEmailExcepto(email, id) {
  const [filas] = await pool.query(
    'SELECT id FROM usuario WHERE email = ? AND id <> ?',
    [email, id]
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

async function crearUsuario(datos) {
  const [resultado] = await pool.query(
    `INSERT INTO usuario
      (apellido, nombre, fecha_nacimiento, password, rol, email, telefono, dni, id_sede, id_cobertura)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      datos.apellido,
      datos.nombre,
      datos.fecha_nacimiento,
      datos.password,
      datos.rol,
      datos.email,
      datos.telefono || '',
      datos.dni,
      datos.id_sede ?? null,
      datos.id_cobertura ?? null
    ]
  );
  return resultado.insertId;
}

async function actualizarUsuario(id, datos) {
  const [resultado] = await pool.query(
    `UPDATE usuario
     SET apellido = ?, nombre = ?, fecha_nacimiento = ?, password = ?, rol = ?,
         email = ?, telefono = ?, dni = ?, id_sede = ?, id_cobertura = ?
     WHERE id = ?`,
    [
      datos.apellido,
      datos.nombre,
      datos.fecha_nacimiento,
      datos.password,
      datos.rol,
      datos.email,
      datos.telefono || '',
      datos.dni,
      datos.id_sede ?? null,
      datos.id_cobertura ?? null,
      id
    ]
  );
  return resultado.affectedRows > 0;
}

async function actualizarPerfil(id, datos) {
  const campos = [];
  const parametros = [];

  if (datos.email !== undefined) {
    campos.push('email = ?');
    parametros.push(datos.email);
  }
  if (datos.password !== undefined) {
    campos.push('password = ?');
    parametros.push(datos.password);
  }
  if (datos.telefono !== undefined) {
    campos.push('telefono = ?');
    parametros.push(datos.telefono);
  }
  if (datos.id_cobertura !== undefined) {
    campos.push('id_cobertura = ?');
    parametros.push(datos.id_cobertura);
  }

  if (campos.length === 0) {
    return false;
  }

  parametros.push(id);
  const [resultado] = await pool.query(
    `UPDATE usuario SET ${campos.join(', ')} WHERE id = ?`,
    parametros
  );
  return resultado.affectedRows > 0;
}

async function buscarPorDni(dni) {
  const [filas] = await pool.query(
    `SELECT id, nombre, apellido, email, telefono, password, rol, id_sede, id_cobertura
     FROM usuario WHERE dni = ?`,
    [dni]
  );
  return filas[0] || null;
}

async function buscarPorId(id) {
  const [filas] = await pool.query(
    `SELECT id, nombre, apellido, DATE_FORMAT(fecha_nacimiento, '%Y-%m-%d') AS fecha_nacimiento,
            email, telefono, dni, rol, id_sede, id_cobertura
     FROM usuario WHERE id = ?`,
    [id]
  );
  return filas[0] || null;
}

async function buscarPorIdConPassword(id) {
  const [filas] = await pool.query(
    `SELECT id, nombre, apellido, DATE_FORMAT(fecha_nacimiento, '%Y-%m-%d') AS fecha_nacimiento,
            password, email, telefono, dni, rol, id_sede, id_cobertura
     FROM usuario WHERE id = ?`,
    [id]
  );
  return filas[0] || null;
}

async function buscarUsuarioEnriquecido(id) {
  const [filas] = await pool.query(`${SELECT_USUARIO} WHERE u.id = ?`, [id]);
  if (!filas[0]) {
    return null;
  }
  await adjuntarEspecialidades(filas);
  return filas[0];
}

async function listarPaginado({ nombre, apellido, rol, id_sede, limite, offset }) {
  const condiciones = [];
  const parametros = [];

  if (nombre) {
    condiciones.push('u.nombre LIKE ?');
    parametros.push(`%${nombre}%`);
  }
  if (apellido) {
    condiciones.push('u.apellido LIKE ?');
    parametros.push(`%${apellido}%`);
  }
  if (rol) {
    condiciones.push('u.rol = ?');
    parametros.push(rol);
  }
  if (id_sede) {
    condiciones.push('u.id_sede = ?');
    parametros.push(id_sede);
  }

  const where = condiciones.length > 0 ? ' WHERE ' + condiciones.join(' AND ') : '';

  const [conteo] = await pool.query(
    `SELECT COUNT(*) AS total FROM usuario u${where}`,
    parametros
  );

  const [filas] = await pool.query(
    `${SELECT_USUARIO}${where} ORDER BY u.apellido, u.nombre LIMIT ? OFFSET ?`,
    [...parametros, limite, offset]
  );

  await adjuntarEspecialidades(filas);

  return { total: Number(conteo[0].total), filas };
}

async function buscarPacientes(busqueda) {
  const parametros = [];
  let extra = '';

  if (busqueda) {
    extra = ' AND (u.dni LIKE ? OR u.apellido LIKE ?)';
    parametros.push(`%${busqueda}%`, `%${busqueda}%`);
  }

  const [filas] = await pool.query(
    `${SELECT_USUARIO} WHERE u.rol = 'paciente'${extra} ORDER BY u.apellido, u.nombre`,
    parametros
  );
  return filas;
}

async function reemplazarEspecialidades(idMedico, idsEspecialidades) {
  await pool.query('DELETE FROM medico_especialidad WHERE id_medico = ?', [idMedico]);
  if (idsEspecialidades.length === 0) {
    return;
  }
  const valores = idsEspecialidades.map((idEspecialidad) => [idMedico, idEspecialidad]);
  await pool.query(
    'INSERT INTO medico_especialidad (id_medico, id_especialidad) VALUES ?',
    [valores]
  );
}

module.exports = {
  existePorDniOEmail,
  existePorDniOEmailExcepto,
  existePorEmailExcepto,
  crear,
  crearUsuario,
  actualizarUsuario,
  actualizarPerfil,
  buscarPorDni,
  buscarPorId,
  buscarPorIdConPassword,
  buscarUsuarioEnriquecido,
  listarPaginado,
  buscarPacientes,
  reemplazarEspecialidades
};
