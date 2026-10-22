const medicoRepository = require('../repositories/medicoRepository');

async function listar(filtros) {
  return medicoRepository.listar({
    especialidad: filtros.especialidad,
    sede: filtros.sede
  });
}

module.exports = { listar };
