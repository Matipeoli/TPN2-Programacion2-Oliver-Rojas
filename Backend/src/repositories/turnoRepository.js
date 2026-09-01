const pool = require('../database/db');

async function buscarAgenda({ id_medico, id_especialidad, id_sede, fecha }) {
  const [filas] = await pool.query(
    'SELECT id, hora_entrada, hora_salida, id_sede FROM agenda WHERE id_medico = ? AND id_especialidad = ? AND id_sede = ? AND fecha = ?',
    [id_medico, id_especialidad, id_sede, fecha]
  );
  return filas[0] || null;
}

async function existeSuperposicion(id_agenda, fecha, hora) {
  const [filas] = await pool.query(
    'SELECT id FROM turno WHERE id_agenda = ? AND fecha = ? AND hora = ? AND estado = ?',
    [id_agenda, fecha, hora, 'confirmado']
  );
  return filas.length > 0;
}

async function crear({ id_agenda, fecha, hora, id_paciente, id_cobertura, nota, estado }) {
  const [resultado] = await pool.query(
    'INSERT INTO turno (id_agenda, fecha, hora, id_paciente, id_cobertura, nota, estado) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id_agenda, fecha, hora, id_paciente, id_cobertura, nota, estado]
  );
  return resultado.insertId;
}

async function buscarPorId(id) {
  const [filas] = await pool.query(
    `SELECT t.id, t.fecha, t.hora, t.nota, t.estado, t.id_paciente, t.id_cobertura,
            a.id_medico, a.id_sede, a.id_especialidad
     FROM turno t
     JOIN agenda a ON t.id_agenda = a.id
     WHERE t.id = ?`,
    [id]
  );
  return filas[0] || null;
}

async function cambiarEstado(id, estado) {
  const [resultado] = await pool.query(
    'UPDATE turno SET estado = ? WHERE id = ?',
    [estado, id]
  );
  return resultado.affectedRows > 0;
}

async function listarPorPaciente(idPaciente){
    const [filas] = await pool.query(
      `SELECT t.id, t.fecha, t.hora, t.nota, t.estado,
              a.id_medico, a.id_especialidad, a.id_sede
        FROM turno t JOIN agenda a ON t.id_agenda = a.id
        WHERE t.id_paciente = ?
        ORDER BY t.fecha ASC, t.hora ASC`, [idPaciente]
    );
    return filas;
}

async function listarPorMedico(idMedico, fecha) {
  const [filas] = await pool.query(
    `SELECT t.id, t.fecha, t.hora, t.nota, t.estado, t.id_paciente, t.id_cobertura,
            a.id_especialidad, a.id_sede
     FROM turno t
     JOIN agenda a ON t.id_agenda = a.id
     WHERE a.id_medico = ? AND t.fecha = ?
     ORDER BY t.hora ASC`,
    [idMedico, fecha]
  );
  return filas;
}

async function listarPorSede(idSede, fecha) {
  const [filas] = await pool.query(
    `SELECT t.id, t.fecha, t.hora, t.nota, t.estado, t.id_paciente, t.id_cobertura,
            a.id_medico, a.id_especialidad
     FROM turno t
     JOIN agenda a ON t.id_agenda = a.id
     WHERE a.id_sede = ? AND t.fecha = ?
     ORDER BY t.hora ASC`,
    [idSede, fecha]
  );
  return filas;
}

module.exports = { buscarAgenda, existeSuperposicion, crear, buscarPorId, cambiarEstado, listarPorPaciente, listarPorMedico, listarPorSede };
