const express = require('express');
const router = express.Router();
const {
  listarCoberturas,
  crearCobertura,
  actualizarCobertura,
  eliminarCobertura
} = require('../controllers/coberturaController');
const { verificarToken, verificarRol } = require('../middlewares/auth');
const { registrarAuditoria } = require('../middlewares/auditoria');

router.get('/', listarCoberturas);

router.use(verificarToken, verificarRol('admin'));

router.post('/', registrarAuditoria('cobertura'), crearCobertura);
router.put('/:id', registrarAuditoria('cobertura'), actualizarCobertura);
router.delete('/:id', registrarAuditoria('cobertura'), eliminarCobertura);

module.exports = router;