const router = require('express').Router();
const c = require('../controllers/productos.controller');
const verificarToken = require('../middlewares/verificarToken');
const soloAdmin = require('../middlewares/soloAdmin');

router.get('/', c.listar);
router.get('/:id', c.obtener);
router.post('/', verificarToken, soloAdmin, c.crear);
router.put('/:id', verificarToken, soloAdmin, c.actualizar);
router.delete('/:id', verificarToken, soloAdmin, c.eliminar);

module.exports = router;
