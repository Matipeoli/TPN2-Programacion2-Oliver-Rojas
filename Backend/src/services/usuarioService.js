const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const usuarioRepository = require('../repositories/usuarioRepository');
const coberturaRepository = require('../repositories/coberturaRepository');
const sedeRepository = require('../repositories/sedeRepository');
const especialidadRepository = require('../repositories/especialidadRepository');
const { AppError } = require('../utils/errores');
const { validarLongitud, validarFormatoFecha } = require('../utils/validaciones');

const SALT_ROUNDS = 10;
const ROLES_USUARIO = ['paciente', 'operador', 'medico', 'admin'];
const ROLES_ALTA = ['operador', 'medico', 'admin'];

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

async function actualizarPerfil(id, datos) {
  const usuario = await usuarioRepository.buscarPorId(id);
  if (!usuario) {
    throw new AppError(404, 'Usuario no encontrado');
  }
  if (usuario.rol !== 'paciente') {
    throw new AppError(403, 'Solo el paciente puede actualizar sus datos personales');
  }

  const cambios = {};

  if (datos.email !== undefined) {
    if (!datos.email) {
      throw new AppError(400, 'El email no puede estar vacio');
    }
    validarLongitud('email', datos.email, 30);
    if (datos.email !== usuario.email) {
      const emailEnUso = await usuarioRepository.existePorEmailExcepto(datos.email, id);
      if (emailEnUso) {
        throw new AppError(409, 'Ya existe un usuario con ese email');
      }
    }
    cambios.email = datos.email;
  }

  if (datos.telefono !== undefined) {
    validarLongitud('telefono', datos.telefono, 10);
    cambios.telefono = datos.telefono || '';
  }

  if (datos.id_cobertura !== undefined) {
    if (!datos.id_cobertura) {
      throw new AppError(400, 'La cobertura es obligatoria');
    }
    const hayCobertura = await coberturaRepository.existePorId(datos.id_cobertura);
    if (!hayCobertura) {
      throw new AppError(400, 'La cobertura indicada no existe');
    }
    cambios.id_cobertura = datos.id_cobertura;
  }

  if (datos.password !== undefined && datos.password !== null && datos.password !== '') {
    cambios.password = await bcrypt.hash(datos.password, SALT_ROUNDS);
  }

  if (Object.keys(cambios).length > 0) {
    await usuarioRepository.actualizarPerfil(id, cambios);
  }

  return usuarioRepository.buscarPorId(id);
}

async function buscarPacientes(filtros) {
  const busqueda = filtros.busqueda ? String(filtros.busqueda).trim() : '';
  return usuarioRepository.buscarPacientes(busqueda);
}

async function listarUsuarios(filtros) {
  const pagina = Math.max(1, parseInt(filtros.pagina, 10) || 1);
  const limite = Math.min(100, Math.max(1, parseInt(filtros.limite, 10) || 10));

  const { total, filas } = await usuarioRepository.listarPaginado({
    nombre: filtros.nombre,
    apellido: filtros.apellido,
    rol: filtros.rol,
    id_sede: filtros.id_sede,
    limite,
    offset: (pagina - 1) * limite
  });

  return {
    total,
    pagina,
    limite,
    totalPaginas: Math.ceil(total / limite),
    usuarios: filas
  };
}

async function resolverSede(rol, idSede, sedeActual) {
  if (rol !== 'operador' && rol !== 'medico') {
    return null;
  }

  const sede = idSede !== undefined && idSede !== null && idSede !== '' ? idSede : sedeActual;
  if (!sede) {
    throw new AppError(400, 'El operador y el medico deben tener una sede asignada');
  }

  const haySede = await sedeRepository.existePorId(sede);
  if (!haySede) {
    throw new AppError(400, 'La sede indicada no existe');
  }

  return Number(sede);
}

async function resolverCobertura(rol, idCobertura, coberturaActual) {
  if (rol !== 'paciente') {
    return null;
  }

  const cobertura = idCobertura !== undefined && idCobertura !== null ? idCobertura : coberturaActual;
  if (!cobertura) {
    throw new AppError(400, 'El paciente debe tener una cobertura');
  }

  const hayCobertura = await coberturaRepository.existePorId(cobertura);
  if (!hayCobertura) {
    throw new AppError(400, 'La cobertura indicada no existe');
  }

  return Number(cobertura);
}

async function resolverEspecialidades(especialidades, obligatorias) {
  if (!Array.isArray(especialidades)) {
    if (obligatorias) {
      throw new AppError(400, 'El medico debe tener al menos una especialidad');
    }
    return null;
  }

  const ids = [...new Set(especialidades.filter((id) => id !== null && id !== undefined && id !== ''))];
  if (obligatorias && ids.length === 0) {
    throw new AppError(400, 'El medico debe tener al menos una especialidad');
  }

  for (const id of ids) {
    const existe = await especialidadRepository.existePorId(id);
    if (!existe) {
      throw new AppError(400, `La especialidad ${id} no existe`);
    }
  }

  return ids.map(Number);
}

async function crearUsuario(datos) {
  const {
    nombre,
    apellido,
    dni,
    email,
    password,
    rol,
    fecha_nacimiento,
    telefono,
    id_sede,
    especialidades
  } = datos;

  if (!nombre || !apellido || !dni || !email || !password || !rol || !fecha_nacimiento) {
    throw new AppError(400, 'Faltan datos obligatorios: nombre, apellido, dni, email, password, rol, fecha_nacimiento');
  }
  if (!ROLES_ALTA.includes(rol)) {
    throw new AppError(400, 'El rol debe ser operador, medico o admin');
  }

  validarLongitud('nombre', nombre, 30);
  validarLongitud('apellido', apellido, 30);
  validarLongitud('email', email, 30);
  validarLongitud('dni', dni, 8);
  validarLongitud('telefono', telefono, 10);
  validarFormatoFecha(fecha_nacimiento, 'fecha_nacimiento');

  const yaExiste = await usuarioRepository.existePorDniOEmail(dni, email);
  if (yaExiste) {
    throw new AppError(409, 'Ya existe un usuario con ese DNI o email');
  }

  const sede = await resolverSede(rol, id_sede, null);
  const idsEspecialidades = rol === 'medico'
    ? await resolverEspecialidades(especialidades, true)
    : null;

  const passwordHasheada = await bcrypt.hash(password, SALT_ROUNDS);

  const id = await usuarioRepository.crearUsuario({
    apellido,
    nombre,
    fecha_nacimiento,
    password: passwordHasheada,
    rol,
    email,
    telefono,
    dni,
    id_sede: sede,
    id_cobertura: null
  });

  if (rol === 'medico') {
    await usuarioRepository.reemplazarEspecialidades(id, idsEspecialidades);
  }

  return usuarioRepository.buscarUsuarioEnriquecido(id);
}

async function actualizarUsuario(id, datos) {
  const existente = await usuarioRepository.buscarPorIdConPassword(id);
  if (!existente) {
    throw new AppError(404, 'El usuario no existe');
  }

  const rol = datos.rol !== undefined ? datos.rol : existente.rol;
  if (!ROLES_USUARIO.includes(rol)) {
    throw new AppError(400, 'El rol indicado no es valido');
  }

  const nombre = datos.nombre !== undefined ? datos.nombre : existente.nombre;
  const apellido = datos.apellido !== undefined ? datos.apellido : existente.apellido;
  const dni = datos.dni !== undefined ? datos.dni : existente.dni;
  const email = datos.email !== undefined ? datos.email : existente.email;
  const telefono = datos.telefono !== undefined ? datos.telefono : existente.telefono;
  const fechaNacimiento = datos.fecha_nacimiento !== undefined
    ? datos.fecha_nacimiento
    : existente.fecha_nacimiento;

  if (!nombre || !apellido || !dni || !email || !fechaNacimiento) {
    throw new AppError(400, 'Faltan datos obligatorios: nombre, apellido, dni, email, fecha_nacimiento');
  }

  validarLongitud('nombre', nombre, 30);
  validarLongitud('apellido', apellido, 30);
  validarLongitud('email', email, 30);
  validarLongitud('dni', dni, 8);
  validarLongitud('telefono', telefono, 10);
  validarFormatoFecha(fechaNacimiento, 'fecha_nacimiento');

  const yaExiste = await usuarioRepository.existePorDniOEmailExcepto(dni, email, id);
  if (yaExiste) {
    throw new AppError(409, 'Ya existe un usuario con ese DNI o email');
  }

  const sede = await resolverSede(rol, datos.id_sede, existente.id_sede);
  const cobertura = await resolverCobertura(rol, datos.id_cobertura, existente.id_cobertura);

  const password = datos.password
    ? await bcrypt.hash(datos.password, SALT_ROUNDS)
    : existente.password;

  await usuarioRepository.actualizarUsuario(id, {
    apellido,
    nombre,
    fecha_nacimiento: fechaNacimiento,
    password,
    rol,
    email,
    telefono,
    dni,
    id_sede: sede,
    id_cobertura: cobertura
  });

  if (rol === 'medico') {
    let idsEspecialidades;
    if (datos.especialidades !== undefined) {
      idsEspecialidades = await resolverEspecialidades(datos.especialidades, true);
    } else if (existente.rol === 'medico') {
      const actual = await usuarioRepository.buscarUsuarioEnriquecido(id);
      idsEspecialidades = actual.especialidades.map((especialidad) => especialidad.id);
      if (idsEspecialidades.length === 0) {
        throw new AppError(400, 'El medico debe tener al menos una especialidad');
      }
    } else {
      throw new AppError(400, 'El medico debe tener al menos una especialidad');
    }
    await usuarioRepository.reemplazarEspecialidades(id, idsEspecialidades);
  } else {
    await usuarioRepository.reemplazarEspecialidades(id, []);
  }

  return usuarioRepository.buscarUsuarioEnriquecido(id);
}

module.exports = {
  registro,
  login,
  perfil,
  actualizarPerfil,
  buscarPacientes,
  listarUsuarios,
  crearUsuario,
  actualizarUsuario
};
