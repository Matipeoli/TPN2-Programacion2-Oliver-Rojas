const express = require('express');
const router = express.Router();
const turnoController = require('../controllers/turnoController');
const { verificarToken, verificarRol } = require('../middlewares/auth');

router.use(verificarToken);

router.post('/', verificarRol('paciente', 'operador'), turnoController.crear);
router.patch('/:id/cancelar', verificarRol('paciente', 'operador', 'medico'), turnoController.cancelar);
router.patch('/:id/atender', verificarRol('medico'), turnoController.atender);

module.exports = router;
