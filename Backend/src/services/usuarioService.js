const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const usuarioRepository = require('../repositories/usuarioRepository');
const coberturaRepository = require('../repositories/coberturaRepository');
const { AppError } = require('../utils/errores');

const SALT_ROUNDS = 10;

async function registro(datos) {
  const { nombre, apellido, dni, email, password, fecha_nacimiento, id_cobertura, telefono } = datos;

  if (!nombre || !apellido || !dni || !email || !password || !fecha_nacimiento || !id_cobertura) {
    throw new AppError(400, 'Faltan datos obligatorios: nombre, apellido, dni, email, password, fecha_nacimiento, id_cobertura');
  }

  const hayCobertura = await coberturaRepository.existePorId(id_cobertura);
  if (!hayCobertura) {
    throw new AppError(400, 'La cobertura indicada no existe');
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
      rol: usuario.rol,
      id_sede: usuario.id_sede
    }
  };
}

async function perfil(usuario) {
  return usuario;
}

module.exports = { registro, login, perfil };