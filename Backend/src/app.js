require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./database/db');
const { enviarRespuesta } = require('./utils/respuesta');
const authRoutes = require('./routes/authRoutes');
const coberturaRoutes = require('./routes/coberturaRoutes');

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
app.use('/coberturas', coberturaRoutes);

app.use((req, res) => {
  return enviarRespuesta(res, 404, 'Recurso no encontrado');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;
