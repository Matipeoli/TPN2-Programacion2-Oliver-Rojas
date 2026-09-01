require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./database/db');
const { enviarRespuesta } = require('./utils/respuesta');
const { AppError } = require('./utils/errores');
const authRoutes = require('./routes/authRoutes');
const coberturaRoutes = require('./routes/coberturaRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const sedeRoutes = require('./routes/sedeRoutes');
const especialidadRoutes = require('./routes/especialidadRoutes');
const agendaRoutes = require('./routes/agendaRoutes');
const auditoriaRoutes = require('./routes/auditoriaRoutes');
const turnoRoutes = require('./routes/turnoRoutes');
const notificacionRoutes = require('./routes/notificacionRoutes');
const historialRoutes = require('./routes/historialRoutes');
const reporteRoutes = require('./routes/reporteRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    return enviarRespuesta(res, 200, 'ok', { db: 'conectada' });
  } catch (error) {
    console.error(error);
    return enviarRespuesta(res, 500, 'No se pudo conectar a la base de datos');
  }
});

app.use('/auth', authRoutes);
app.use('/auth', usuarioRoutes);
app.use('/coberturas', coberturaRoutes);
app.use('/sedes', sedeRoutes);
app.use('/especialidades', especialidadRoutes);
app.use('/agenda', agendaRoutes);
app.use('/turnos', turnoRoutes);
app.use('/notificaciones', notificacionRoutes);
app.use('/historial', historialRoutes);
app.use('/auditoria', auditoriaRoutes);
app.use('/reportes', reporteRoutes);

app.use((req, res) => {
  return enviarRespuesta(res, 404, 'Recurso no encontrado');
});

app.use((err, req, res, next) => {
  if (err instanceof AppError) {
    return enviarRespuesta(res, err.codigo, err.estado);
  }
  console.error(err);
  return enviarRespuesta(res, 500, 'Error interno del servidor');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;
