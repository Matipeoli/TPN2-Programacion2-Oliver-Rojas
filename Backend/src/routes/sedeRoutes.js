const express = require('express');
const router = express.Router();
const sedeController = require('../controllers/sedeController');
const { verificarToken, verificarRol } = require('../middlewares/auth');

router.use(verificarToken, verificarRol('admin'));

router.get('/', sedeController.listar);
router.post('/', sedeController.crear);
router.put('/:id', sedeController.actualizar);
router.delete('/:id', sedeController.eliminar);

module.exports = router;