const Favorito = require('../models/favorito.model');
const Producto = require('../models/producto.model');

const idValido = (id) => /^\d+$/.test(String(id)) && Number(id) > 0;

async function listar(req, res, next) {
  try {
    const favoritos = await Favorito.listar(req.usuario.id);
    res.status(200).json({ ok: true, data: favoritos });
  } catch (err) { next(err); }
}

async function agregar(req, res, next) {
  try {
    const productoId = req.body && req.body.productoId;
    if (!idValido(productoId)) {
      return res.status(400).json({ ok: false, mensaje: 'productoId debe ser un entero positivo' });
    }
    const producto = await Producto.obtener(productoId);
    if (!producto) {
      return res.status(404).json({ ok: false, mensaje: 'Producto no encontrado' });
    }
    const favorito = await Favorito.agregar(req.usuario.id, Number(productoId));
    res.status(201).json({ ok: true, data: favorito });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ ok: false, mensaje: 'El producto ya está en tus favoritos' });
    }
    next(err);
  }
}

async function quitar(req, res, next) {
  try {
    if (!idValido(req.params.productoId)) {
      return res.status(400).json({ ok: false, mensaje: 'productoId debe ser un entero positivo' });
    }
    const quitado = await Favorito.quitar(req.usuario.id, Number(req.params.productoId));
    if (!quitado) {
      return res.status(404).json({ ok: false, mensaje: 'Ese producto no está en tus favoritos' });
    }
    res.status(204).send();
  } catch (err) { next(err); }
}

module.exports = { listar, agregar, quitar };
