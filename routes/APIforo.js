const express = require("express");
const router = express.Router();
const { sequelize } = require('../db/db');
const { 
  agregarRespuesta, 
  obtenerRespuestasPorPregunta, 
  obtenerPreguntas, 
  obtenerPreguntasPorUsuario, 
  obtenerForoCompleto, 
  agregarPregunta, 
  obtenerNumeroRespuestasPorPregunta
} = require('../models/foro');

// Ruta para obtener el foro completo
/**
 * @swagger
 * /api/obtenerForoCompleto:
 *   get:
 *     summary: Obtener el foro completo
 *     description: Retorna todas las preguntas y respuestas disponibles en el foro.
 *     responses:
 *       200:
 *         description: Foro completo obtenido con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Error al obtener el foro
 */
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
/**
 * @swagger
 * /api/preguntas:
 *   get:
 *     summary: Obtener preguntas del foro
 *     description: Obtiene todas las preguntas del foro, o filtra por correo de usuario si se proporciona.
 *     parameters:
 *       - in: query
 *         name: usuarioCorreo
 *         required: false
 *         description: Correo del usuario para filtrar preguntas asociadas a ese usuario
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de preguntas obtenidas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Error al obtener preguntas
 */
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
/**
 * @swagger
 * /api/preguntas:
 *   post:
 *     summary: Agregar una nueva pregunta al foro
 *     description: Permite a un usuario agregar una nueva pregunta al foro.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               usuarioCorreo:
 *                 type: string
 *                 description: Correo electrónico del usuario que agrega la pregunta
 *               pregunta:
 *                 type: string
 *                 description: El contenido de la pregunta
 *     responses:
 *       201:
 *         description: Pregunta agregada con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Pregunta agregada con éxito"
 *                 pregunta:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: ID de la pregunta agregada
 *                     usuarioCorreo:
 *                       type: string
 *                     pregunta:
 *                       type: string
 *       400:
 *         description: Faltan campos obligatorios
 *       500:
 *         description: Error al agregar la pregunta
 */
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
/**
 * @swagger
 * /api/obtenerRespuestas:
 *   get:
 *     summary: Obtener respuestas de una pregunta
 *     description: Obtiene todas las respuestas asociadas a una pregunta específica mediante su ID.
 *     parameters:
 *       - in: query
 *         name: preguntaId
 *         required: true
 *         description: ID de la pregunta para la que se obtienen las respuestas
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de respuestas obtenidas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Error al obtener respuestas
 */
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
/**
 * @swagger
 * /api/agregarRespuesta:
 *   post:
 *     summary: Agregar una respuesta a una pregunta
 *     description: Permite a un usuario agregar una respuesta a una pregunta existente en el foro.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pregunta_id:
 *                 type: integer
 *                 description: ID de la pregunta a la que se está respondiendo
 *               usuario_respuesta:
 *                 type: string
 *                 description: Correo electrónico del usuario que responde
 *               mensaje_respuesta:
 *                 type: string
 *                 description: El contenido de la respuesta
 *     responses:
 *       201:
 *         description: Respuesta agregada con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: Error al agregar respuesta
 */
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


// Ruta para obtener el número de respuestas de una pregunta
/**
 * @swagger
 * /api/obtenerNumeroRespuestas:
 *   get:
 *     summary: Obtener el número de respuestas de una pregunta
 *     description: Devuelve el número de respuestas para una pregunta específica, basado en el ID de la pregunta.
 *     parameters:
 *       - in: query
 *         name: preguntaId
 *         required: true
 *         description: ID de la pregunta para la cual se desean obtener el número de respuestas.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Número de respuestas encontrado con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 numRespuestas:
 *                   type: integer
 *                   description: Número de respuestas para la pregunta especificada
 *       400:
 *         description: ID de la pregunta no válido o falta el parámetro
 *       500:
 *         description: Error interno del servidor al obtener el número de respuestas
 */
router.get('/obtenerNumeroRespuestas', async (req, res) => {
  const { preguntaId } = req.query;
  try {
    const numRespuestas = await obtenerNumeroRespuestasPorPregunta(preguntaId);
    res.status(200).json({ numRespuestas });
  } catch (error) {
    console.error('Error al obtener el número de respuestas:', error);
    res.status(500).json({ error: 'Error al obtener el número de respuestas' });
  }
});

// Ruta para eliminar una pregunta de un usuario del foro
router.delete('/BorroPreguntas/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await sequelize.query(
      'DELETE FROM pregunta WHERE id = $1 RETURNING *',
      {
        bind: [id],
        type: sequelize.QueryTypes.DELETE
      }
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Pregunta no encontrada' });
    }

    res.status(200).json({ mensaje: 'Pregunta eliminada con éxito' });
  } catch (error) {
    console.error('Error al eliminar la pregunta:', error);
    res.status(500).json({ error: 'Error al eliminar la pregunta' });
  }
});

// Ruta para eliminar una respuesta de un usuario del foro
router.delete('/BorroRespuestas/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await sequelize.query(
      'DELETE FROM respuesta WHERE id = $1 RETURNING *',
      {
        bind: [id],
        type: sequelize.QueryTypes.DELETE
      }
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Respuesta no encontrada' });
    }

    res.status(200).json({ mensaje: 'Respuesta eliminada con éxito' });
  } catch (error) {
    console.error('Error al eliminar la respuesta:', error);
    res.status(500).json({ error: 'Error al eliminar la respuesta' });
  }
});

module.exports = router;
