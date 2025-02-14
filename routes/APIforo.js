const express = require("express");
const passport = require("passport");

const router = express.Router();

import { obtenerPreguntas, obtenerPreguntasPorUsuario, obtenerForoCompleto } from '../models/foro';

//obtener foro entero
export default async function handler(req, res) {
  try {
    const foro = await obtenerForoCompleto();
    res.status(200).json(foro);
  } catch (error) {
    console.error('Error al obtener foro:', error);
    res.status(500).json({ error: 'Error al obtener foro' });
  }
}

//si le mandamos el cuerpo de un usuario nos devolverá las preguntas que ha hecho ese usuario
//si no le mandamos nada nos devolverá todas las preguntas
export const handlerPreguntas = async (req, res) => {
  const { usuarioCorreo } = req.query;
  try {
    const preguntas = usuarioCorreo ? await obtenerPreguntasPorUsuario(usuarioCorreo) : await obtenerPreguntas();
    res.status(200).json(preguntas);
  } catch (error) {
    console.error('Error al obtener preguntas:', error);
    res.status(500).json({ error: 'Error al obtener preguntas' });
  }
};
