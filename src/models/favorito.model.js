const pool = require('../config/db');

async function listar(usuarioId) {
  const r = await pool.query(
    `SELECT p.id, p.nombre, p.descripcion, p.categoria, p.precio, f.creado_en AS agregado_en
     FROM favoritos f
     JOIN productos p ON p.id = f.producto_id
     WHERE f.usuario_id = $1
     ORDER BY f.id`,
    [usuarioId]
  );
  return r.rows;
}

async function agregar(usuarioId, productoId) {
  const r = await pool.query(
    'INSERT INTO favoritos (usuario_id, producto_id) VALUES ($1, $2) RETURNING id, producto_id, creado_en',
    [usuarioId, productoId]
  );
  return r.rows[0];
}

async function quitar(usuarioId, productoId) {
  const r = await pool.query(
    'DELETE FROM favoritos WHERE usuario_id = $1 AND producto_id = $2',
    [usuarioId, productoId]
  );
  return r.rowCount > 0;
}

module.exports = { listar, agregar, quitar };
