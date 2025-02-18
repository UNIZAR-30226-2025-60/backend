const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Usa un .env para la URL de Neon
  ssl: { rejectUnauthorized: false }
});

//Desde el frontend llamaremos a esta función para obtener todas las preguntas y mostrar el foro
const obtenerPreguntas = async () => {
  const query = `
    SELECT p.id, p.cuestion, p.fecha_mensaje, u.correo as usuario
    FROM pregunta p
    JOIN usuario u ON p.usuario_id = u.correo
    ORDER BY p.fecha_mensaje DESC;
  `;
  const { rows } = await pool.query(query);
  return rows;
};

//Desde frontend tendríamos que hacer una petición GET a /api/foro con el cuerpo del usuario que ha iniciado sesión
//para obtener las preguntas que ha hecho ese usuario
const obtenerPreguntasPorUsuario = async (usuarioCorreo) => {
  const query = `
    SELECT p.id, p.cuestion, p.fecha_mensaje, u.correo as usuario
    FROM pregunta p
    JOIN usuario u ON p.usuario_id = u.correo
    WHERE p.usuario_id = $1
    ORDER BY p.fecha_mensaje DESC;
  `;
  const { rows } = await pool.query(query, [usuarioCorreo]);
  return rows;
};

//En la pantalla que montemos el foro tendremos que hacer una petición GET a /api/foro para obtener todas las preguntas y sus respuestas ya ordenadas
//por fecha de pregunta y fecha de respuesta,
//he creado una pantalla de ejemplo en vue(cutre) pero para que se vea como se llamaría a esta función
const obtenerForoCompleto = async () => {
  const query = `
    SELECT 
      p.id as pregunta_id, p.cuestion, p.fecha_mensaje as fecha_pregunta, u.correo as usuario_pregunta,
      r.id as respuesta_id, r.mensaje_respuesta, r.fecha as fecha_respuesta, ur.correo as usuario_respuesta
    FROM pregunta p
    JOIN usuario u ON p.usuario_id = u.correo
    LEFT JOIN respuesta r ON p.id = r.pregunta_id
    LEFT JOIN usuario ur ON r.usuario_respuesta = ur.correo
    ORDER BY p.fecha_mensaje DESC, r.fecha DESC;
  `;
  const { rows } = await pool.query(query);
  const foro = rows.reduce((acc, row) => {
    const preguntaId = row.pregunta_id;
    if (!acc[preguntaId]) {
      acc[preguntaId] = {
        id: preguntaId,
        cuestion: row.cuestion,
        fecha: row.fecha_pregunta,
        usuario: row.usuario_pregunta,
        respuestas: []
      };
    }
    if (row.respuesta_id) {
      acc[preguntaId].respuestas.push({
        id: row.respuesta_id,
        mensaje: row.mensaje_respuesta,
        fecha: row.fecha_respuesta,
        usuario: row.usuario_respuesta
      });
    }
    return acc;
  }, {});
  return Object.values(foro);
};

// Funcion para añadir una pregunta a la base de datos
const agregarPregunta = async (usuarioCorreo, pregunta) => {
  const query = `
    INSERT INTO pregunta (usuario_id, cuestion, fecha_mensaje)
    VALUES ($1, $2, NOW()) 
    RETURNING *;
  `;
  try {
    const { rows } = await pool.query(query, [usuarioCorreo, pregunta]);
    return rows[0]; // Devuelve la pregunta insertada
  } catch (error) {
    console.error("Error al insertar la pregunta:", error);
    throw error;
  }
};

// Funcion para obtener las respuestas de una pregunta
const obtenerRespuestasPorPregunta = async (preguntaId) => {
  const query = `
    SELECT r.id, r.mensaje_respuesta, r.fecha, u.correo as usuario_respuesta
    FROM respuesta r
    JOIN usuario u ON r.usuario_respuesta = u.correo
    WHERE r.pregunta_id = $1
    ORDER BY r.fecha DESC;
  `;
  const { rows } = await pool.query(query, [preguntaId]);
  return rows;
};

// Funcion para añadir una respuesta a la base de datos
const agregarRespuesta = async (preguntaId, usuarioCorreo, mensaje) => {
  const query = `
    INSERT INTO respuesta (mensaje_respuesta, pregunta_id, usuario_respuesta, fecha)
    VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
    RETURNING *;
  `;
  try {
    const { rows } = await pool.query(query, [mensaje, preguntaId, usuarioCorreo]);
    return rows[0];
  } catch (error) {
    console.error('Error al insertar respuesta:', error);
    throw error;
  }
};


module.exports = { agregarRespuesta , obtenerRespuestasPorPregunta , obtenerPreguntas, obtenerPreguntasPorUsuario, obtenerForoCompleto, agregarPregunta };
