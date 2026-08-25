const pool = require('../database/db.js');

async function existePorTurno(idTurno){
    const [filas] = await pool.query(
        'SELECT id FROM historial_clinico WHERE id_turno = ?',
        [idTurno]
    );

    return filas.length > 0;
}

async function crear({ id_turno, id_medico, id_paciente, diagnostico, tratamiento, observaciones }){
    const [resultado] = await pool.query(
        'INSERT INTO historial_clinico (id_turno, id_medico, id_paciente, diagnostico, tratamiento, observaciones) VALUES (?, ?, ?, ?, ?, ?, NOW())',
        [id_turno, id_medico, id_paciente, diagnostico, tratamiento, observaciones]
    );

    return resultado.insertId;
}


module.exports = { existePorTurno, crear };