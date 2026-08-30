const express = require('express');
const router = express.Router();
const auditoriaController = require('../controllers/auditoriaController');
const { verificarToken, verificarRol } = require('../middlewares/auth');

router.use(verificarToken, verificarRol('admin'));

router.get('/', auditoriaController.listar);

module.exports = router;
