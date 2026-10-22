const express = require('express');
const router = express.Router();
const medicoController = require('../controllers/medicoController');
const { verificarToken } = require('../middlewares/auth');

router.use(verificarToken);

router.get('/', medicoController.listar);

module.exports = router;
