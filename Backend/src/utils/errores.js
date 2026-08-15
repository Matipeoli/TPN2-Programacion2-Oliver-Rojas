class AppError extends Error {
  constructor(codigo, estado) {
    super(estado);
    this.codigo = codigo;
    this.estado = estado;
  }
}

module.exports = { AppError };