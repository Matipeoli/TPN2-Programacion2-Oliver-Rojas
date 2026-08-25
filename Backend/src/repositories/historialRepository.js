const pool = require('../database/db.js');

async function existePorTurno(idTurno){
    const [filas] = await pool.query(
        'SELECT id FROM historial_clinico WHERE id_turno = ?',
        [idTurno]
    );

    return filas.length > 0;
}


module.exports = { existePorTurno };