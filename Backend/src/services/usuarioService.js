const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const usuarioRepository = require('../repositories/usuarioRepository');
const coberturaRepository = require('../repositories/coberturaRepository');
const sedeRepository = require('../repositories/sedeRepository');
const { AppError } = require('../utils/errores');
const { validarLongitud, validarFormatoFecha } = require('../utils/validaciones');

const SALT_ROUNDS = 10;

async function registro(datos) {
  const { nombre, apellido, dni, email, password, fecha_nacimiento, id_cobertura, telefono, id_sede } = datos;

  if (!nombre || !apellido || !dni || !email || !password || !fecha_nacimiento || !id_cobertura) {
    throw new AppError(400, 'Faltan datos obligatorios: nombre, apellido, dni, email, password, fecha_nacimiento, id_cobertura');
  }

  validarLongitud('nombre', nombre, 30);
  validarLongitud('apellido', apellido, 30);
  validarLongitud('email', email, 30);
  validarLongitud('dni', dni, 8);
  validarLongitud('telefono', telefono, 10);
  validarFormatoFecha(fecha_nacimiento, 'fecha_nacimiento');

  const hayCobertura = await coberturaRepository.existePorId(id_cobertura);
  if (!hayCobertura) {
    throw new AppError(400, 'La cobertura indicada no existe');
  }

  if (id_sede !== undefined && id_sede !== null) {
    const haySede = await sedeRepository.existePorId(id_sede);
    if (!haySede) {
      throw new AppError(400, 'La sede indicada no existe');
    }
  }

  const yaExiste = await usuarioRepository.existePorDniOEmail(dni, email);
  if (yaExiste) {
    throw new AppError(409, 'Ya existe un usuario con ese DNI o email');
  }

  const passwordHasheada = await bcrypt.hash(password, SALT_ROUNDS);

  const id = await usuarioRepository.crear({
    apellido,
    nombre,
    fecha_nacimiento,
    password: passwordHasheada,
    email,
    telefono,
    dni,
    id_sede,
    id_cobertura
  });

  return { id, nombre, apellido, dni, email, rol: 'paciente' };
}

async function login({ dni, password }) {
  if (!dni || !password) {
    throw new AppError(400, 'Debe enviar dni y password');
  }

  const usuario = await usuarioRepository.buscarPorDni(dni);
  if (!usuario) {
    throw new AppError(401, 'Credenciales invalidas');
  }

  const passwordValida = await bcrypt.compare(password, usuario.password);
  if (!passwordValida) {
    throw new AppError(401, 'Credenciales invalidas');
  }

  const token = jwt.sign(
    { id: usuario.id, rol: usuario.rol, id_sede: usuario.id_sede },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );

  return {
    token,
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      telefono: usuario.telefono,
      rol: usuario.rol,
      id_sede: usuario.id_sede,
      id_cobertura: usuario.id_cobertura
    }
  };
}

async function perfil(id) {
  const usuario = await usuarioRepository.buscarPorId(id);
  if (!usuario) {
    throw new AppError(404, 'Usuario no encontrado');
  }
  return usuario;
}

module.exports = { registro, login, perfil };