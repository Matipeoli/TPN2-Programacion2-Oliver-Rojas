const reporteRepository = require('../repositories/reporteRepository');
const { AppError } = require('../utils/errores');
const { validarFormatoFecha } = require('../utils/validaciones');

function validarRangoFechas(filtros) {
  const { fecha_desde, fecha_hasta } = filtros;

  if (fecha_desde) {
    validarFormatoFecha(fecha_desde, 'fecha_desde');
  }
  if (fecha_hasta) {
    validarFormatoFecha(fecha_hasta, 'fecha_hasta');
  }
  if (fecha_desde && fecha_hasta && fecha_desde > fecha_hasta) {
    throw new AppError(400, 'fecha_desde no puede ser posterior a fecha_hasta');
  }
}

async function turnosPorEspecialidad(filtros) {
  validarRangoFechas(filtros);
  return reporteRepository.buscarPorEspecialidad(filtros);
}

async function turnosPorSede(filtros) {
  validarRangoFechas(filtros);
  return reporteRepository.turnosPorSede(filtros);
}

async function rankingMedicos(filtros) {
  validarRangoFechas(filtros);
  return reporteRepository.rankingMedicos(filtros);
}

async function tasaCancelacion(filtros) {
  validarRangoFechas(filtros);

  const totales = await reporteRepository.buscarPorTotalCancelados(filtros);
  const totalTurnos = Number(totales ? totales.total_turnos : 0) || 0;
  const totalCancelados = Number(totales ? totales.total_cancelados : 0) || 0;

  return {
    total_turnos: totalTurnos,
    total_cancelados: totalCancelados,
    tasa_cancelacion: totalTurnos > 0 ? Number((totalCancelados / totalTurnos).toFixed(4)) : 0
  };
}

module.exports = { turnosPorEspecialidad, turnosPorSede, rankingMedicos, tasaCancelacion };