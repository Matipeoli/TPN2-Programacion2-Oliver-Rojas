const express = require('express');
const router = express.Router();
const { perfil } = require('../controllers/usuarioController');
const { verificarToken } = require('../middlewares/auth');

router.get('/perfil', verificarToken, perfil);

module.exports = router;