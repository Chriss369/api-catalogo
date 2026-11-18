require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const productos = [
  ['Laptop Lenovo IdeaPad', 'Laptop de 15 pulgadas con 8 GB de RAM y 256 GB SSD', 'Tecnología', 549.99],
  ['Mouse inalámbrico', 'Mouse ergonómico con conexión USB y batería de larga duración', 'Accesorios', 15.5],
  ['Teclado mecánico', 'Teclado mecánico con retroiluminación y switches azules', 'Accesorios', 45.0],
  ['Audífonos Bluetooth', 'Audífonos con cancelación de ruido y 20 horas de batería', 'Audio', 79.9],
  ['Monitor 24 pulgadas', 'Monitor Full HD con panel IPS y entrada HDMI', 'Tecnología', 139.0],
];

async function main() {
  const dbName = new URL(process.env.DATABASE_URL).pathname.slice(1);

  const adminUrl = new URL(process.env.DATABASE_URL);
  adminUrl.pathname = '/postgres';
  const admin = new Client({ connectionString: adminUrl.toString() });
  await admin.connect();
  const existe = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
  if (existe.rowCount === 0) {
    await admin.query(`CREATE DATABASE "${dbName}"`);
    console.log(`Base de datos "${dbName}" creada`);
  }
  await admin.end();

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const sql = fs.readFileSync(path.join(__dirname, '../../sql/schema.sql'), 'utf8');
  await client.query(sql);
  console.log('Tablas listas');

  const total = await client.query('SELECT COUNT(*) FROM productos');
  if (Number(total.rows[0].count) === 0) {
    for (const [nombre, descripcion, categoria, precio] of productos) {
      await client.query(
        'INSERT INTO productos (nombre, descripcion, categoria, precio) VALUES ($1, $2, $3, $4)',
        [nombre, descripcion, categoria, precio]
      );
    }
    console.log('5 productos de ejemplo insertados');
  } else {
    console.log('Ya existen productos, no se insertó nada');
  }

  await client.end();
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
