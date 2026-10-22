const pool = require('../database/db');

async function listar({ especialidad, sede }) {
  let sql = `
    SELECT u.id, u.nombre, u.apellido,
           e.id AS id_especialidad, e.descripcion AS especialidad
    FROM usuario u
    LEFT JOIN medico_especialidad me ON me.id_medico = u.id
    LEFT JOIN especialidad e ON e.id = me.id_especialidad
    WHERE u.rol = 'medico'
  `;
  const condiciones = [];
  const parametros = [];

  if (especialidad) {
    condiciones.push(
      'EXISTS (SELECT 1 FROM medico_especialidad mef WHERE mef.id_medico = u.id AND mef.id_especialidad = ?)'
    );
    parametros.push(especialidad);
  }
  if (sede) {
    condiciones.push(
      '(u.id_sede = ? OR EXISTS (SELECT 1 FROM agenda af WHERE af.id_medico = u.id AND af.id_sede = ?))'
    );
    parametros.push(sede, sede);
  }

  if (condiciones.length > 0) {
    sql += ' AND ' + condiciones.join(' AND ');
  }
  sql += ' ORDER BY u.apellido, u.nombre, e.descripcion';

  const [filas] = await pool.query(sql, parametros);

  const medicos = new Map();
  for (const fila of filas) {
    if (!medicos.has(fila.id)) {
      medicos.set(fila.id, {
        id: fila.id,
        nombre: fila.nombre,
        apellido: fila.apellido,
        especialidades: []
      });
    }
    if (fila.id_especialidad) {
      const medico = medicos.get(fila.id);
      if (!medico.especialidades.some((e) => e.id === fila.id_especialidad)) {
        medico.especialidades.push({
          id: fila.id_especialidad,
          descripcion: fila.especialidad
        });
      }
    }
  }

  return Array.from(medicos.values());
}

module.exports = { listar };
