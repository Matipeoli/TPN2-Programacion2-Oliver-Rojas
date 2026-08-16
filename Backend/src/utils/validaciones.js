const { AppError } = require('./errores');

function validarLongitud(campo, valor, max) {
  if (valor !== undefined && valor !== null && String(valor).length > max) {
    throw new AppError(400, `${campo} no puede superar ${max} caracteres`);
  }
}

function validarFormatoFecha(valor, campo) {
  if (valor && !/^\d{4}-\d{2}-\d{2}$/.test(String(valor))) {
    throw new AppError(400, `Formato invalido para ${campo}: debe ser YYYY-MM-DD`);
  }
}

function validarFormatoHora(valor, campo) {
  if (valor && !/^\d{2}:\d{2}(:\d{2})?$/.test(String(valor))) {
    throw new AppError(400, `Formato invalido para ${campo}: debe ser HH:MM`);
  }
}

module.exports = { validarLongitud, validarFormatoFecha, validarFormatoHora };