const express = require("express");
const router = express.Router();

const { agregarRespuesta , obtenerRespuestasPorPregunta , obtenerPreguntas, obtenerPreguntasPorUsuario, obtenerForoCompleto, agregarPregunta } = require('../models/foro');

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

// Ruta para agregar una pregunta
router.post('/preguntas', async (req, res) => {
  const { usuarioCorreo, pregunta } = req.body;

  // Validación de datos
  if (!usuarioCorreo || !pregunta) {
    return res.status(400).json({ error: "Se requieren correo de usuario y una pregunta" });
  }

  try {
    const nuevaPregunta = await agregarPregunta(usuarioCorreo, pregunta);
    res.status(201).json({ mensaje: "Pregunta agregada con éxito", pregunta: nuevaPregunta });
  } catch (error) {
    console.error('Error al agregar la pregunta:', error);
    res.status(500).json({ error: 'Error al agregar la pregunta' });
  }
});

// Ruta para obtener respuestas de una pregunta
router.get('/obtenerRespuestas', async (req, res) => {
  const { preguntaId } = req.query;
  try {
    const respuestas = await obtenerRespuestasPorPregunta(preguntaId);
    res.status(200).json(respuestas);
  } catch (error) {
    console.error('Error al obtener respuestas:', error);
    res.status(500).json({ error: 'Error al obtener respuestas' });
  }
});

// Ruta para agregar una respuesta
router.post('/agregarRespuesta', async (req, res) => {
  const { pregunta_id, usuario_respuesta, mensaje_respuesta } = req.body;
  try {
    const nuevaRespuesta = await agregarRespuesta(pregunta_id, usuario_respuesta, mensaje_respuesta);
    res.status(201).json(nuevaRespuesta);
  } catch (error) {
    console.error('Error al agregar respuesta:', error);
    res.status(500).json({ error: 'Error al agregar respuesta', detalle: error.message });
  }
});

module.exports = router;
