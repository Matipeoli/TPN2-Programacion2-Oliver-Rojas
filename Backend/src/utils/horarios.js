const DURACION_TURNO_MINUTOS = 30;

function horaAMinutos(hora) {
  const [horas, minutos] = String(hora).slice(0, 5).split(':').map(Number);
  return horas * 60 + minutos;
}

function minutosAHora(minutos) {
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return `${String(horas).padStart(2, '0')}:${String(resto).padStart(2, '0')}`;
}

module.exports = { DURACION_TURNO_MINUTOS, horaAMinutos, minutosAHora };
