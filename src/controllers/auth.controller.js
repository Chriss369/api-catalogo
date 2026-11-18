const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario.model');

const CORREO_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function registro(req, res, next) {
  try {
    const { nombre, correo, password } = req.body || {};
    const errores = [];
    if (typeof nombre !== 'string' || nombre.trim() === '') errores.push('nombre es obligatorio');
    if (typeof correo !== 'string' || !CORREO_REGEX.test(correo.trim())) errores.push('correo no es válido');
    if (typeof password !== 'string' || password.length < 8) errores.push('password debe tener al menos 8 caracteres');
    if (errores.length) {
      return res.status(400).json({ ok: false, mensaje: 'Datos inválidos', errores });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const usuario = await Usuario.crear({
      nombre: nombre.trim(),
      correo: correo.trim().toLowerCase(),
      passwordHash,
    });
    res.status(201).json({ ok: true, data: usuario });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ ok: false, mensaje: 'El correo ya está registrado' });
    }
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { correo, password } = req.body || {};
    if (typeof correo !== 'string' || typeof password !== 'string' || !correo || !password) {
      return res.status(400).json({ ok: false, mensaje: 'correo y password son obligatorios' });
    }

    const usuario = await Usuario.buscarPorCorreo(correo.trim().toLowerCase());
    const valido = usuario && (await bcrypt.compare(password, usuario.password_hash));
    if (!valido) {
      return res.status(401).json({ ok: false, mensaje: 'Credenciales incorrectas' });
    }

    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );
    res.status(200).json({
      ok: true,
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol },
    });
  } catch (err) { next(err); }
}

function perfil(req, res) {
  res.status(200).json({ ok: true, data: req.usuario });
}

module.exports = { registro, login, perfil };