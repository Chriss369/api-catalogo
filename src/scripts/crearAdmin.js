require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function main() {
  const { ADMIN_NOMBRE, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_NOMBRE || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error('Faltan ADMIN_NOMBRE, ADMIN_EMAIL o ADMIN_PASSWORD en .env');
  }
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await pool.query(
    `INSERT INTO usuarios (nombre, correo, password_hash, rol)
     VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (correo) DO UPDATE
     SET nombre = EXCLUDED.nombre, password_hash = EXCLUDED.password_hash, rol = 'admin'`,
    [ADMIN_NOMBRE, ADMIN_EMAIL.toLowerCase(), hash]
  );
  console.log(`Administrador listo: ${ADMIN_EMAIL}`);
  await pool.end();
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
