const express = require('express');
const router = express.Router();
const sedeController = require('../controllers/sedeController');
const { verificarToken, verificarRol } = require('../middlewares/auth');
const { registrarAuditoria } = require('../middlewares/auditoria');

router.use(verificarToken);

router.get('/', sedeController.listar);
router.post('/', verificarRol('admin'), registrarAuditoria('sede'), sedeController.crear);
router.put('/:id', verificarRol('admin'), registrarAuditoria('sede'), sedeController.actualizar);
router.delete('/:id', verificarRol('admin'), registrarAuditoria('sede'), sedeController.eliminar);

module.exports = router;