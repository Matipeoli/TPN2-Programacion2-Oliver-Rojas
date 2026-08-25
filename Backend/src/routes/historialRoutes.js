const express = require('express');
const router = express.Router();
const historialController = require('../controllers/historialController');
const { verificarToken, verificarRol } = require('../middlewares/auth');

router.use(verificarToken);

router.post('/', verificarRol('medico'), historialController.crear);
router.get('/paciente/:id_paciente', verificarRol('paciente', 'medico'), historialController.consultarPorPaciente);

module.exports = router;