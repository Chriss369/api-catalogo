const Producto = require('../models/producto.model');

const idValido = (id) => /^\d+$/.test(id) && Number(id) > 0;

function validarProducto(body) {
  const errores = [];
  const { nombre, descripcion, categoria, precio } = body || {};
  for (const [campo, valor] of [['nombre', nombre], ['descripcion', descripcion], ['categoria', categoria]]) {
    if (typeof valor !== 'string' || valor.trim() === '') {
      errores.push(`${campo} es obligatorio`);
    }
  }
  const p = Number(precio);
  if (precio === undefined || precio === null || precio === '' || Number.isNaN(p) || p <= 0) {
    errores.push('precio debe ser un número mayor que cero');
  }
  return errores;
}

async function listar(req, res, next) {
  try {
    const productos = await Producto.listar(req.query.categoria);
    res.status(200).json({ ok: true, data: productos });
  } catch (err) { next(err); }
}

async function obtener(req, res, next) {
  try {
    if (!idValido(req.params.id)) {
      return res.status(400).json({ ok: false, mensaje: 'El id debe ser un entero positivo' });
    }
    const producto = await Producto.obtener(req.params.id);
    if (!producto) {
      return res.status(404).json({ ok: false, mensaje: 'Producto no encontrado' });
    }
    res.status(200).json({ ok: true, data: producto });
  } catch (err) { next(err); }
}

async function crear(req, res, next) {
  try {
    const errores = validarProducto(req.body);
    if (errores.length) {
      return res.status(400).json({ ok: false, mensaje: 'Datos inválidos', errores });
    }
    const producto = await Producto.crear({ ...req.body, precio: Number(req.body.precio) });
    res.status(201).json({ ok: true, data: producto });
  } catch (err) { next(err); }
}

async function actualizar(req, res, next) {
  try {
    if (!idValido(req.params.id)) {
      return res.status(400).json({ ok: false, mensaje: 'El id debe ser un entero positivo' });
    }
    const errores = validarProducto(req.body);
    if (errores.length) {
      return res.status(400).json({ ok: false, mensaje: 'Datos inválidos', errores });
    }
    const producto = await Producto.actualizar(req.params.id, { ...req.body, precio: Number(req.body.precio) });
    if (!producto) {
      return res.status(404).json({ ok: false, mensaje: 'Producto no encontrado' });
    }
    res.status(200).json({ ok: true, data: producto });
  } catch (err) { next(err); }
}

async function eliminar(req, res, next) {
  try {
    if (!idValido(req.params.id)) {
      return res.status(400).json({ ok: false, mensaje: 'El id debe ser un entero positivo' });
    }
    const eliminado = await Producto.eliminar(req.params.id);
    if (!eliminado) {
      return res.status(404).json({ ok: false, mensaje: 'Producto no encontrado' });
    }
    res.status(204).send();
  } catch (err) { next(err); }
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
