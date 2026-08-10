const express = require('express');
const router = express.Router();
const { registro, login } = require('../controllers/authController');
const { verificarToken, verificarRol } = require('../middlewares/auth');
const { enviarRespuesta } = require('../utils/respuesta');

router.post('/registro', registro);
router.post('/login', login);


router.get('/admin', verificarToken, verificarRol('admin', 'operador'), (req, res) => {
  return enviarRespuesta(res, 200, 'ok', { mensaje: 'Acceso permitido para rol ' + req.usuario.rol });
});

module.exports = router;
