function soloAdmin(req, res, next) {
  if (!req.usuario || req.usuario.rol !== 'admin') {
    return res.status(403).json({ ok: false, mensaje: 'Acceso denegado: se requiere rol administrador' });
  }
  next();
}

module.exports = soloAdmin;
