# Clinica - Backend

API REST para el TP integrador de Programacion 2. Incluye autenticacion por JWT, gestion de sedes, especialidades, coberturas, agenda, turnos, historial clinico, notificaciones, auditoria y reportes.

## Versiones

- Node.js 24.15.0
- npm 11.12.1
- MySQL / MariaDB (probado con MariaDB 10.4.32 de XAMPP)
- Express 5.2.1
- mysql2 3.11
- bcrypt 5.1
- jsonwebtoken 9.0

## Requisitos

- Node.js 24 o superior.
- MySQL o MariaDB en ejecucion.
- Una base de datos llamada `clinica`.

## Instalacion

1. Crear la base y cargar los datos de prueba. Desde la raiz del repositorio:

```sql
CREATE DATABASE clinica CHARACTER SET utf8 COLLATE utf8_general_ci;
```

Importar el script `BD/clinica.sql` con phpMyAdmin o por consola:

```bash
mysql -u root -p clinica < BD/clinica.sql
```

2. Configurar las variables de entorno. Copiar `Backend/.env.example` a `Backend/.env` y completar los datos de conexion:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=clinica
JWT_SECRET=una_clave_secreta
JWT_EXPIRES_IN=8h
PORT=8080
```

3. Instalar dependencias y levantar el servidor:

```bash
cd Backend
npm install
npm run dev
```

El servidor queda disponible en `http://localhost:8080`. `npm start` ejecuta el servidor sin nodemon.

## Datos de prueba

Todos los usuarios tienen la password `1234`.

| Rol | Nombre | DNI |
|---|---|---|
| admin | Marcos Gomez | 18222333 |
| operador | Juan Perez | 15200548 |
| medico | Ana Lopez (sedes 1 y 2) | 20111222 |
| medico | Pablo Rodriguez (sede 1) | 22333444 |
| medico | Lucia Martinez (sede 2) | 23444555 |
| paciente | Franco Friggeri | 36000960 |
| paciente | Maria Sosa | 41000111 |
| paciente | Carlos Diaz | 12000222 |

La base incluye turnos en estado `confirmado`, `cancelado` y `atendido`, historial clinico, notificaciones leidas y no leidas, tres coberturas y cuatro especialidades. Las fechas de agenda se cargan con `CURDATE()` y `DATE_ADD(...)`, por lo que siguen vigentes al momento de la demo.

## Endpoints principales

Todas las respuestas respetan el formato `{ "codigo": 200, "estado": "ok", "datos": ... }`.

### Publicos

| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | `/health` | Estado de la conexion con la base |
| GET | `/coberturas` | Listado de coberturas |
| POST | `/auth/registro` | Registro de paciente |
| POST | `/auth/login` | Login con DNI y password |

### Autenticados

| Metodo | Ruta | Roles | Descripcion |
|---|---|---|---|
| GET | `/auth/perfil` | Todos | Datos del usuario autenticado |
| PATCH | `/auth/perfil` | paciente | Actualiza email, password, telefono y cobertura |
| GET | `/sedes` | Todos | Listado de sedes |
| GET | `/especialidades` | Todos | Listado de especialidades |
| GET | `/medicos?especialidad=&sede=` | Todos | Medicos con sus especialidades |
| GET | `/notificaciones` | Todos | Notificaciones del usuario |
| PATCH | `/notificaciones/:id/leer` | Todos | Marca una notificacion como leida |

### Paciente y operador

| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | `/turnos/disponibilidad/fechas?id_medico=&id_especialidad=&id_sede=` | Fechas con agenda |
| GET | `/turnos/disponibilidad/horarios?id_medico=&id_especialidad=&id_sede=&fecha=` | Horarios libres de 30 minutos |
| POST | `/turnos` | Alta de turno (paciente u operador) |
| PATCH | `/turnos/:id/cancelar` | Cancelacion de turno |

### Gestion por rol

| Metodo | Ruta | Roles | Descripcion |
|---|---|---|---|
| GET | `/agenda` | medico, operador, admin | Agenda enriquecida con medico, especialidad y sede |
| POST | `/agenda` | medico, operador, admin | Alta de rango horario |
| PUT | `/agenda/:id` | medico, operador, admin | Modificacion de rango |
| DELETE | `/agenda/:id` | medico, operador, admin | Baja de rango |
| GET | `/turnos/paciente` | paciente | Turnos propios enriquecidos |
| GET | `/turnos/medico?fecha=` | medico | Turnos del medico en todas sus sedes |
| GET | `/turnos/sede?fecha=` | operador | Turnos de la sede del operador |
| PATCH | `/turnos/:id/atender` | medico | Marca un turno como atendido |
| POST | `/historial` | medico | Registra historial de un turno atendido |
| GET | `/historial/paciente/:id_paciente` | paciente, medico | Historial del paciente |
| GET | `/pacientes?busqueda=` | operador, medico, admin | Busca pacientes por DNI o apellido |
| GET | `/usuarios?pagina=&limite=&nombre=&apellido=&rol=&id_sede=` | admin | Usuarios paginados |
| POST | `/usuarios` | admin | Alta de operador, medico o admin |
| PUT | `/usuarios/:id` | admin | Edicion de cualquier usuario |
| GET | `/auditoria` | admin | Log de auditoria |
| GET | `/reportes/...` | admin | Reportes y estadisticas |

## Reglas de negocio incluidas

- El paciente solo puede editar email, password, telefono y cobertura.
- El medico solo opera sobre su propia agenda y sus propios turnos, en cualquiera de las sedes donde atiende.
- El operador solo modifica agenda y turnos de su sede. Puede consultar otras sedes.
- No se elimina un rango de agenda con turnos confirmados ni se modifica dejando turnos confirmados fuera del nuevo horario.
- No se elimina una especialidad con medicos o agenda asociada.
- Se permiten varios rangos horarios por dia; el alta de turno busca el rango que contiene la hora solicitada.
- La duracion de turno es de 30 minutos. La disponibilidad devuelve solo horarios libres dentro de la agenda.
- Cada alta y modificacion de usuarios se registra en auditoria.

El alta de pacientes desde el rol operador se realiza con `POST /auth/registro`, reutilizando el mismo formulario y las mismas validaciones del registro publico.

## Postman

La coleccion `Backend/Prog2.postman_collection.json` apunta a `http://localhost:8080`. Incluye login de los cuatro roles, endpoints existentes y la carpeta `06 - Soporte frontend` con los endpoints agregados para las semanas 2 a 4.
