const pool = require('../config/db');

async function crear({ nombre, correo, passwordHash }) {
  const r = await pool.query(
    "INSERT INTO usuarios (nombre, correo, password_hash, rol) VALUES ($1, $2, $3, 'usuario') RETURNING id, nombre, correo, rol",
    [nombre, correo, passwordHash]
  );
  return r.rows[0];
}

async function buscarPorCorreo(correo) {
  const r = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
  return r.rows[0];
}

module.exports = { crear, buscarPorCorreo };
