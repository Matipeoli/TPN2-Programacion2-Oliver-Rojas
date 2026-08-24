const express = require('express');
const router = express.Router();
const turnoController = require('../controllers/turnoController');
const { verificarToken, verificarRol } = require('../middlewares/auth');

router.use(verificarToken);

router.post('/', verificarRol('paciente', 'operador'), turnoController.crear);
router.patch('/:id/cancelar', verificarRol('paciente', 'operador', 'medico'), turnoController.cancelar);
router.patch('/:id/atender', verificarRol('medico'), turnoController.atender);
router.get('/paciente', verificarRol('paciente'), turnoController.listarPorPaciente);
router.get('/medico', verificarRol('medico'), turnoController.listarPorMedico);
router.get('/sede', verificarRol('operador'), turnoController.listarPorSede);

module.exports = router;
