const express = require('express');
const router = express.Router();
const especialidadController = require('../controllers/especialidadController');
const { verificarToken, verificarRol } = require('../middlewares/auth');

router.use(verificarToken, verificarRol('admin'));

router.get('/', especialidadController.listar);
router.post('/', especialidadController.crear);
router.put('/:id', especialidadController.actualizar);
router.delete('/:id', especialidadController.eliminar);

module.exports = router;