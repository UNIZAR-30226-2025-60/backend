const express = require("express");
const router = express.Router();

const { obtenerPreguntas, obtenerPreguntasPorUsuario, obtenerForoCompleto } = require('../models/foro');

// Ruta para obtener el foro completo
router.get('/obtenerForoCompleto', async (req, res) => {
  try {
    const foro = await obtenerForoCompleto();
    res.status(200).json(foro);
  } catch (error) {
    console.error('Error al obtener foro:', error);
    res.status(500).json({ error: 'Error al obtener foro' });
  }
});

// Ruta para obtener preguntas con o sin usuario
router.get('/preguntas', async (req, res) => {
  const { usuarioCorreo } = req.query;
  try {
    const preguntas = usuarioCorreo ? await obtenerPreguntasPorUsuario(usuarioCorreo) : await obtenerPreguntas();
    res.status(200).json(preguntas);
  } catch (error) {
    console.error('Error al obtener preguntas:', error);
    res.status(500).json({ error: 'Error al obtener preguntas' });
  }
});

module.exports = router;
