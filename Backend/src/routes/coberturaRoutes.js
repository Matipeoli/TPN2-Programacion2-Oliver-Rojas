const express = require('express');
const router = express.Router();
const {
  listarCoberturas,
  crearCobertura,
  actualizarCobertura,
  eliminarCobertura
} = require('../controllers/coberturaController');
const { verificarToken, verificarRol } = require('../middlewares/auth');

router.get('/', listarCoberturas);

router.use(verificarToken, verificarRol('admin'));

router.post('/', crearCobertura);
router.put('/:id', actualizarCobertura);
router.delete('/:id', eliminarCobertura);

module.exports = router;