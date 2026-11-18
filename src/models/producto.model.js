const pool = require('../config/db');

async function listar(categoria) {
  if (categoria) {
    const r = await pool.query(
      'SELECT * FROM productos WHERE LOWER(categoria) = LOWER($1) ORDER BY id',
      [categoria]
    );
    return r.rows;
  }
  const r = await pool.query('SELECT * FROM productos ORDER BY id');
  return r.rows;
}

async function obtener(id) {
  const r = await pool.query('SELECT * FROM productos WHERE id = $1', [id]);
  return r.rows[0];
}

async function crear({ nombre, descripcion, categoria, precio }) {
  const r = await pool.query(
    'INSERT INTO productos (nombre, descripcion, categoria, precio) VALUES ($1, $2, $3, $4) RETURNING *',
    [nombre.trim(), descripcion.trim(), categoria.trim(), precio]
  );
  return r.rows[0];
}

async function actualizar(id, { nombre, descripcion, categoria, precio }) {
  const r = await pool.query(
    'UPDATE productos SET nombre = $1, descripcion = $2, categoria = $3, precio = $4 WHERE id = $5 RETURNING *',
    [nombre.trim(), descripcion.trim(), categoria.trim(), precio, id]
  );
  return r.rows[0];
}

async function eliminar(id) {
  const r = await pool.query('DELETE FROM productos WHERE id = $1', [id]);
  return r.rowCount > 0;
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
