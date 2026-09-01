const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporteController');
const { verificarToken, verificarRol } = require('../middlewares/auth');

router.use(verificarToken, verificarRol('admin'));

router.get('/turnos-por-especialidad', reporteController.turnosPorEspecialidad);
router.get('/turnos-por-sede', reporteController.turnosPorSede);
router.get('/ranking-medicos', reporteController.rankingMedicos);
router.get('/tasa-cancelacion', reporteController.tasaCancelacion);

module.exports = router;