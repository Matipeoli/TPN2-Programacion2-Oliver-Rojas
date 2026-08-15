const coberturaRepository = require('../repositories/coberturaRepository');

async function listarCoberturas() {
  return coberturaRepository.listar();
}

module.exports = { listarCoberturas };