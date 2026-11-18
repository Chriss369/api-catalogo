const router = require('express').Router();
const c = require('../controllers/auth.controller');
const verificarToken = require('../middlewares/verificarToken');

router.post('/registro', c.registro);
router.post('/login', c.login);
router.get('/perfil', verificarToken, c.perfil);

module.exports = router;
