const pool = require('../database/db');

async function buscarAgenda({ id_medico, id_especialidad, id_sede, fecha, hora }) {
  const [filas] = await pool.query(
    `SELECT id, hora_entrada, hora_salida, id_sede
     FROM agenda
     WHERE id_medico = ? AND id_especialidad = ? AND id_sede = ? AND fecha = ?
       AND ? >= hora_entrada AND ? < hora_salida
     ORDER BY hora_entrada
     LIMIT 1`,
    [id_medico, id_especialidad, id_sede, fecha, hora, hora]
  );
  return filas[0] || null;
}

async function listarFechasDisponibles({ id_medico, id_especialidad, id_sede }) {
  const [filas] = await pool.query(
    `SELECT DISTINCT DATE_FORMAT(fecha, '%Y-%m-%d') AS fecha
     FROM agenda
     WHERE id_medico = ? AND id_especialidad = ? AND id_sede = ? AND fecha >= CURDATE()
     ORDER BY fecha`,
    [id_medico, id_especialidad, id_sede]
  );
  return filas.map((fila) => fila.fecha);
}

async function listarAgendaDelDia({ id_medico, id_especialidad, id_sede, fecha }) {
  const [filas] = await pool.query(
    `SELECT id, hora_entrada, hora_salida
     FROM agenda
     WHERE id_medico = ? AND id_especialidad = ? AND id_sede = ? AND fecha = ?
     ORDER BY hora_entrada`,
    [id_medico, id_especialidad, id_sede, fecha]
  );
  return filas;
}

async function listarHorasConfirmadas(idsAgenda, fecha) {
  if (idsAgenda.length === 0) {
    return [];
  }
  const [filas] = await pool.query(
    `SELECT hora FROM turno
     WHERE id_agenda IN (?) AND fecha = ? AND estado = 'confirmado'`,
    [idsAgenda, fecha]
  );
  return filas.map((fila) => fila.hora);
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
      `SELECT t.id, DATE_FORMAT(t.fecha, '%Y-%m-%d') AS fecha, t.hora, t.nota, t.estado,
              a.id_medico, a.id_especialidad, a.id_sede,
              m.nombre AS medico_nombre, m.apellido AS medico_apellido,
              e.descripcion AS especialidad, s.nombre AS sede
        FROM turno t
        JOIN agenda a ON t.id_agenda = a.id
        JOIN usuario m ON m.id = a.id_medico
        JOIN especialidad e ON e.id = a.id_especialidad
        JOIN sede s ON s.id = a.id_sede
        WHERE t.id_paciente = ?
        ORDER BY t.fecha ASC, t.hora ASC`, [idPaciente]
    );
    return filas;
}

async function listarPorMedico(idMedico, fecha) {
  const [filas] = await pool.query(
    `SELECT t.id, DATE_FORMAT(t.fecha, '%Y-%m-%d') AS fecha, t.hora, t.nota, t.estado,
            t.id_paciente, t.id_cobertura,
            p.nombre AS paciente_nombre, p.apellido AS paciente_apellido,
            DATE_FORMAT(p.fecha_nacimiento, '%Y-%m-%d') AS paciente_fecha_nacimiento,
            a.id_especialidad, a.id_sede,
            e.descripcion AS especialidad, s.nombre AS sede
     FROM turno t
     JOIN agenda a ON t.id_agenda = a.id
     JOIN usuario p ON p.id = t.id_paciente
     JOIN especialidad e ON e.id = a.id_especialidad
     JOIN sede s ON s.id = a.id_sede
     WHERE a.id_medico = ? AND t.fecha = ?
     ORDER BY t.hora ASC`,
    [idMedico, fecha]
  );
  return filas;
}

async function listarPorSede(idSede, fecha) {
  const [filas] = await pool.query(
    `SELECT t.id, DATE_FORMAT(t.fecha, '%Y-%m-%d') AS fecha, t.hora, t.nota, t.estado,
            t.id_paciente, t.id_cobertura,
            p.nombre AS paciente_nombre, p.apellido AS paciente_apellido,
            DATE_FORMAT(p.fecha_nacimiento, '%Y-%m-%d') AS paciente_fecha_nacimiento,
            a.id_medico, a.id_especialidad,
            m.nombre AS medico_nombre, m.apellido AS medico_apellido,
            e.descripcion AS especialidad, s.nombre AS sede
     FROM turno t
     JOIN agenda a ON t.id_agenda = a.id
     JOIN usuario p ON p.id = t.id_paciente
     JOIN usuario m ON m.id = a.id_medico
     JOIN especialidad e ON e.id = a.id_especialidad
     JOIN sede s ON s.id = a.id_sede
     WHERE a.id_sede = ? AND t.fecha = ?
     ORDER BY t.hora ASC`,
    [idSede, fecha]
  );
  return filas;
}

module.exports = {
  buscarAgenda,
  existeSuperposicion,
  crear,
  buscarPorId,
  cambiarEstado,
  listarPorPaciente,
  listarPorMedico,
  listarPorSede,
  listarFechasDisponibles,
  listarAgendaDelDia,
  listarHorasConfirmadas
};
