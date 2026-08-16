const express = require('express');
const router = express.Router();
const agendaController = require('../controllers/agendaController');
const { verificarToken, verificarRol } = require('../middlewares/auth');

router.use(verificarToken, verificarRol('medico', 'operador', 'admin'));

router.get('/', agendaController.listar);
router.post('/', agendaController.crear);
router.put('/:id', agendaController.actualizar);
router.delete('/:id', agendaController.eliminar);

module.exports = router;
