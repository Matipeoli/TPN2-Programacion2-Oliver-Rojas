# Backend – Semana 4 (Entrega parcial)

> Este archivo resume **qué se hizo** (Consigna 1: Auditoría) y **qué falta** (Consigna 2 y 3) para que el compañero pueda continuar sin perder contexto. Rama: `entrega-backend-4`.

---

## Contexto general del proyecto

- **Stack:** Node.js + Express (`express` v5) + MySQL (`mysql2/promise`).
- **Estructura en capas:** `routes/` → `controllers/` → `services/` → `repositories/`.
- **Respuesta uniforme:** todas las respuestas usan `{ codigo, estado, datos }` vía `src/utils/respuesta.js` (`enviarRespuesta`).
- **Errores:** clase `AppError(codigo, estado)` en `src/utils/errores.js`, manejados centralmente en `src/app.js` (errores 404 y 500 genéricos).
- **Middlewares de auth ya existentes** (`src/middlewares/auth.js`):
  - `verificarToken` → valida el JWT y deja `req.usuario = { id, rol, id_sede }`.
  - `verificarRol(...roles)` → rechaza con **403** si el rol del token no está en la lista.
- **Config:** `.env` con `DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET, JWT_EXPIRES_IN, PORT`. El backend se levanta con `npm run dev` (nodemon `src/app.js`).

### Tablas relevantes del esquema (BD `clinica`)
El esquema completo (proporcionado por el compañero) incluye: `sede`, `cobertura`, `especialidad`, `usuario`, `medico_especialidad`, `agenda`, `turno`, `historial_clinico`, `log_auditoria`, `notificacion`.

- `agenda` = turnos de agenda de un médico (hora_entrada, hora_salida, fecha, id_medico, id_especialidad, id_sede).
- `turno` = turno reservado por un paciente (**NO existe endpoint de turnos todavía en el backend**; solo existe `agenda`).
- `log_auditoria`: columnas `id`, `id_usuario` (NOT NULL, FK usuario), `accion` (ALTA/BAJA/MODIFICACION), `entidad` (30), `id_entidad`, `detalle` (255), `fecha` (datetime default CURRENT_TIMESTAMP).
- `estado` de `turno` puede ser `confirmado`, `atendido`, etc. (usado para cancelación en reportes pendientes).

---

## ✅ LO QUE YA SE HIZO (Consigna 1 – Logs de Auditoría)

### Archivos nuevos creados
| Archivo | Rol |
|---|---|
| `src/database/log_auditoria.sql` | DDL de la tabla `log_auditoria` (coincide con el esquema real) |
| `src/repositories/auditoriaRepository.js` | Queries de insert y de consulta con filtros |
| `src/services/auditoriaService.js` | Lógica de negocio de auditoría (registrar + listar con validaciones) |
| `src/controllers/auditoriaController.js` | Ctrl GET /auditoria |
| `src/routes/auditoriaRoutes.js` | Ruta `/auditoria` protegida con `verificarToken` + `verificarRol('admin')` |
| `src/middlewares/auditoria.js` | **Interceptor automático** que registra las acciones sin tocar los controllers |

### Archivos modificados
- `src/app.js` → se monta `app.use('/auditoria', auditoriaRoutes)`.
- `src/routes/coberturaRoutes.js`, `src/routes/sedeRoutes.js`, `src/routes/especialidadRoutes.js` → se agregó el middleware `registrarAuditoria('entidad')` a cada POST/PUT/DELETE.
- `src/routes/authRoutes.js` → se agregó `registrarAuditoria('usuario')` al `POST /auth/registro`.
- `Prog2.postman_collection.json` → se agregó el endpoint `listar_auditoria`.

### Cómo funciona el registro automático (sin código repetido)
El middleware `registrarAuditoria(entidad)` (`src/middlewares/auditoria.js`) se monta en las rutas de mutación. Intercepta la llamada, **escribe sobre `res.json`** para capturar la respuesta, y a partir del método HTTP deduce la acción:

- `POST` → `ALTA`
- `PUT`/`PATCH` → `MODIFICACION`
- `DELETE` → `BAJA`

Luego registra en `log_auditoria`:
- `id_usuario`: tomado de `req.usuario.id` (token). Para el caso público `POST /auth/registro`, se usa el `id` del usuario recién creado (actor = el propio paciente).
- `entidad`: la que se pasa al middleware (`cobertura`, `sede`, `especialidad`, `usuario`).
- `id_entidad`: para ALTA el id del registro creado (del body de la respuesta); para modificación/eliminación el `req.params.id`.
- `detalle`: mensaje legible (ej. `Nuevo registro creado con id 5`) o `JSON.stringify(datos)`.
- `fecha`: la pone la BD con `CURRENT_TIMESTAMP`.

> **Nota:** para `DELETE` y `PUT` el `id_entidad` se toma de `req.params.id`. Si el endpoint no tuviera `:id` en la ruta, `id_entidad` queda `NULL` (columna nullable).

### Endpoint de consulta de auditoría
```
GET /auditoria            (Bearer token, rol admin)
```
Filtros por query string (todos opcionales):
- `id_usuario` → filtra por actor.
- `entidad` → filtra por entidad (`usuario`, `cobertura`, `sede`, `especialidad`).
- `fecha_desde` / `fecha_hasta` → rango de fechas en formato `YYYY-MM-DD`.

Ejemplo:
```
GET /auditoria?id_usuario=4&entidad=usuario&fecha_desde=2025-10-01&fecha_hasta=2025-10-31
```

Respuesta exitosa (200):
```json
{
  "codigo": 200,
  "estado": "ok",
  "datos": [
    {
      "id": 1,
      "id_usuario": 4,
      "accion": "ALTA",
      "entidad": "usuario",
      "id_entidad": 2,
      "detalle": "Nuevo registro creado con id 2",
      "fecha": "2025-10-01 10:00:00",
      "nombre_usuario": "Gomez, Marcos"
    }
  ]
}
```
- Sin token → `401 Token no provisto`.
- Con token pero rol ≠ admin → `403 No tiene permisos para acceder a este recurso`.

---

## 🔜 LO QUE FALTA (para la otra mitad de la entrega)

### Consigna 2 – Reportes y estadísticas (solo rol admin)
Los reportes NO requieren tablas nuevas y se resuelven con consultas agregadas sobre `turno`, `agenda`, `especialidad` y `sede`. Falta:
1. **Cantidad de turnos por especialidad** (join `turno`→`agenda`→`especialidad`).
2. **Cantidad de turnos por sede** (join `turno`→`agenda`→`sede`).
3. **Ranking de médicos por cantidad de turnos atendidos** (no solo el primero; usar `estado='atendido'` en `turno` unido a `agenda`/`usuario`).
4. **Tasa de cancelación del período** (turnos cancelados / total turnos).
5. Todos los indicadores con filtro por **rango de fechas** `fecha_desde` / `fecha_hasta` (YYYY-MM-DD).
6. Responder con la misma estructura `{ codigo, estado, datos }` y proteger con `verificarToken` + `verificarRol('admin')` → 403 si no es admin.

Sugerencia: seguir el mismo patrón en capas (crear `reporteRepository.js`, `reporteService.js`, `reporteController.js`, `reporteRoutes.js` y montar `app.use('/reportes', reporteRoutes)`). El estado `atendido`/`cancelado` se define en la columna `turno.estado`.

### Consigna 3 – Documentación de la API
- Documentar **todos** los endpoints (semanas 1 a 4): método, ruta, parámetros, body esperado, respuestas posibles (éxito y error) y rol que puede acceder.
- Se eligió **Postman**: la colección `Prog2.postman_collection.json` ya existe y hay que completarla con los endpoints de reportes que haga el compañero (cada uno con auth bearer `{{token}}`).

### Consigna 4 – Cierre y pulido
- Verificar consistencia entre endpoints (ej: que una cancelación de turno actualice correctamente los reportes).
- Revisar que los mensajes de error y códigos HTTP sean consistentes en todo el proyecto.
- Confirmar que `npm run dev` levante sin errores.

---

## Endpoints existentes a la fecha (para no romper)
- `GET /health`
- `POST /auth/registro`, `POST /auth/login`, `GET /auth/admin`
- `GET /auth/perfil` (token)
- `/coberturas` (GET público; POST/PUT/DELETE admin)
- `/sedes` (GET/POST/PUT/DELETE admin)
- `/especialidades` (GET/POST/PUT/DELETE admin)
- `/agenda` (GET/POST/PUT/DELETE con token, roles medico/operador/admin)
- `GET /auditoria` (solo admin) — **nuevo**

## Datos de prueba relevantes (del SQL)
- Admins: usuario id 4 (Gomez, Marcos). Operador: id 1. Médico: id 3 (Lopez, Ana). Paciente: id 2 (Friggeri, Franco).
- `agenda` id 2: médico 3, especialidad 1, sede 1.
- `turno` id 2: agenda 2, paciente 2, cobertura 1, estado `atendido`.
- Claves de acceso reales deben cargarse hasheadas con bcrypt (las del dump son placeholders).
