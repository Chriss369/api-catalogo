const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
  const cabecera = req.headers.authorization || '';
  const [tipo, token] = cabecera.split(' ');

  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ ok: false, mensaje: 'Token requerido' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = { id: payload.id, rol: payload.rol };
    next();
  } catch (err) {
    const mensaje = err.name === 'TokenExpiredError' ? 'Token vencido' : 'Token inválido';
    return res.status(401).json({ ok: false, mensaje });
  }
}

module.exports = verificarToken;
