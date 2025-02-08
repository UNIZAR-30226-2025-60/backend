const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const librosRoutes = require('./routes/libros');
const usuariosRoutes = require('./routes/usuarios');

app.use('/api/libros', librosRoutes);
app.use('/api/usuarios', usuariosRoutes);

app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
