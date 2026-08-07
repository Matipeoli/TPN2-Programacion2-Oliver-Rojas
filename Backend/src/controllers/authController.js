const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../database/db');
const { enviarRespuesta } = require('../utils/respuesta');

const SALT_ROUNDS = 10;

async function registro(req, res) {
  try {
    const {
      nombre,
      apellido,
      dni,
      email,
      password,
      fecha_nacimiento,
      id_cobertura,
      telefono
    } = req.body;

    if (!nombre || !apellido || !dni || !email || !password || !fecha_nacimiento || !id_cobertura) {
      return enviarRespuesta(res, 400, 'Faltan datos obligatorios: nombre, apellido, dni, email, password, fecha_nacimiento, id_cobertura');
    }

    const [coberturaExiste] = await pool.query(
      'SELECT id FROM cobertura WHERE id = ?',
      [id_cobertura]
    );
    if (coberturaExiste.length === 0) {
      return enviarRespuesta(res, 400, 'La cobertura indicada no existe');
    }

    const [existentes] = await pool.query(
      'SELECT id FROM usuario WHERE dni = ? OR email = ?',
      [dni, email]
    );
    if (existentes.length > 0) {
      return enviarRespuesta(res, 409, 'Ya existe un usuario con ese DNI o email');
    }

    const passwordHasheada = await bcrypt.hash(password, SALT_ROUNDS);

    const [resultado] = await pool.query(
      `INSERT INTO usuario
        (apellido, nombre, fecha_nacimiento, password, rol, email, telefono, dni, id_sede, id_cobertura)
       VALUES (?, ?, ?, ?, 'paciente', ?, ?, ?, NULL, ?)`,
      [apellido, nombre, fecha_nacimiento, passwordHasheada, email, telefono || '', dni, id_cobertura]
    );

    return enviarRespuesta(res, 201, 'ok', {
      id: resultado.insertId,
      nombre,
      apellido,
      dni,
      email,
      rol: 'paciente'
    });
  } catch (error) {
    console.error(error);
    return enviarRespuesta(res, 500, 'Error interno al registrar el usuario');
  }
}

async function login(req, res) {
  try {
    const { dni, password } = req.body;

    if (!dni || !password) {
      return enviarRespuesta(res, 400, 'Debe enviar dni y password');
    }

    const [filas] = await pool.query(
      'SELECT id, nombre, apellido, password, rol, id_sede FROM usuario WHERE dni = ?',
      [dni]
    );

    if (filas.length === 0) {
      return enviarRespuesta(res, 401, 'Credenciales invalidas');
    }

    const usuario = filas[0];
    const passwordValida = await bcrypt.compare(password, usuario.password);

    if (!passwordValida) {
      return enviarRespuesta(res, 401, 'Credenciales invalidas');
    }

    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol, id_sede: usuario.id_sede },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    return enviarRespuesta(res, 200, 'ok', {
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        rol: usuario.rol,
        id_sede: usuario.id_sede
      }
    });
  } catch (error) {
    console.error(error);
    return enviarRespuesta(res, 500, 'Error interno al iniciar sesion');
  }
}

module.exports = { registro, login };