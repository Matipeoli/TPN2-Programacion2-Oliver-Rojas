const express = require('express');
const router = express.Router();
const especialidadController = require('../controllers/especialidadController');
const { verificarToken, verificarRol } = require('../middlewares/auth');
const { registrarAuditoria } = require('../middlewares/auditoria');

router.use(verificarToken, verificarRol('admin'));

router.get('/', especialidadController.listar);
router.post('/', registrarAuditoria('especialidad'), especialidadController.crear);
router.put('/:id', registrarAuditoria('especialidad'), especialidadController.actualizar);
router.delete('/:id', registrarAuditoria('especialidad'), especialidadController.eliminar);

module.exports = router;