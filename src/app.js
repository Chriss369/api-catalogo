const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const productosRoutes = require('./routes/productos.routes');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/salud', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/productos', productosRoutes);

app.use((req, res) => {
  res.status(404).json({ ok: false, mensaje: 'Ruta no encontrada' });
});

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ ok: false, mensaje: 'JSON inválido en el cuerpo de la petición' });
  }
  console.error(err);
  res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
});

module.exports = app;
