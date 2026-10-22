const express = require('express');
const router = express.Router();
const {
  listarUsuarios,
  crearUsuario,
  actualizarUsuario
} = require('../controllers/usuarioController');
const { verificarToken, verificarRol } = require('../middlewares/auth');
const { registrarAuditoria } = require('../middlewares/auditoria');

router.use(verificarToken, verificarRol('admin'));

router.get('/', listarUsuarios);
router.post('/', registrarAuditoria('usuario'), crearUsuario);
router.put('/:id', registrarAuditoria('usuario'), actualizarUsuario);

module.exports = router;
