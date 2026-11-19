const router = require('express').Router();
const c = require('../controllers/favoritos.controller');
const verificarToken = require('../middlewares/verificarToken');

router.use(verificarToken);

router.get('/', c.listar);
router.post('/', c.agregar);
router.delete('/:productoId', c.quitar);

module.exports = router;
