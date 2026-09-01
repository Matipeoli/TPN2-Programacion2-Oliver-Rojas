const { AppError } = require('./errores');

function validarLongitud(campo, valor, max) {
  if (valor !== undefined && valor !== null && String(valor).length > max) {
    throw new AppError(400, `${campo} no puede superar ${max} caracteres`);
  }
}

function validarFormatoFecha(valor, campo) {
  if (!valor) {
    return;
  }
  const texto = String(valor);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
    throw new AppError(400, `Formato invalido para ${campo}: debe ser YYYY-MM-DD`);
  }
  const fecha = new Date(texto + 'T00:00:00Z');
  if (isNaN(fecha.getTime()) || fecha.toISOString().slice(0, 10) !== texto) {
    throw new AppError(400, `Fecha invalida para ${campo}: ${texto} no es una fecha real`);
  }
}

function validarFormatoHora(valor, campo) {
  if (valor && !/^\d{2}:\d{2}(:\d{2})?$/.test(String(valor))) {
    throw new AppError(400, `Formato invalido para ${campo}: debe ser HH:MM`);
  }
}

module.exports = { validarLongitud, validarFormatoFecha, validarFormatoHora };