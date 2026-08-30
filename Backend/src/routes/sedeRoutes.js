const express = require('express');
const router = express.Router();
const sedeController = require('../controllers/sedeController');
const { verificarToken, verificarRol } = require('../middlewares/auth');
const { registrarAuditoria } = require('../middlewares/auditoria');

router.use(verificarToken, verificarRol('admin'));

router.get('/', sedeController.listar);
router.post('/', registrarAuditoria('sede'), sedeController.crear);
router.put('/:id', registrarAuditoria('sede'), sedeController.actualizar);
router.delete('/:id', registrarAuditoria('sede'), sedeController.eliminar);

module.exports = router;