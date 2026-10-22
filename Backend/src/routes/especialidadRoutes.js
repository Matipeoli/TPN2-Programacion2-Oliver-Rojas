const express = require('express');
const router = express.Router();
const especialidadController = require('../controllers/especialidadController');
const { verificarToken, verificarRol } = require('../middlewares/auth');
const { registrarAuditoria } = require('../middlewares/auditoria');

router.use(verificarToken);

router.get('/', especialidadController.listar);
router.post('/', verificarRol('admin'), registrarAuditoria('especialidad'), especialidadController.crear);
router.put('/:id', verificarRol('admin'), registrarAuditoria('especialidad'), especialidadController.actualizar);
router.delete('/:id', verificarRol('admin'), registrarAuditoria('especialidad'), especialidadController.eliminar);

module.exports = router;