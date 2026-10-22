const express = require('express');
const router = express.Router();
const { buscarPacientes } = require('../controllers/usuarioController');
const { verificarToken, verificarRol } = require('../middlewares/auth');

router.use(verificarToken, verificarRol('operador', 'medico', 'admin'));

router.get('/', buscarPacientes);

module.exports = router;
