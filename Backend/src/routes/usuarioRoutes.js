const express = require('express');
const router = express.Router();
const { perfil, actualizarPerfil } = require('../controllers/usuarioController');
const { verificarToken, verificarRol } = require('../middlewares/auth');

router.get('/perfil', verificarToken, perfil);
router.patch('/perfil', verificarToken, verificarRol('paciente'), actualizarPerfil);

module.exports = router;