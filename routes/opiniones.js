const express = require('express');
const router = express.Router();
const { Libro } = require('../models/Libro');
const { Opinion , agregarOpinion , obtenerOpinionesPorUsuario } = require('../models/Opiniones');


// OBTENER TODAS LAS OPINIONES DADO UN LIBRO Y UNA VALORACIÓN (ej, para un libro, todas las reseñas que tienen un 4 como valoración)
//http://localhost:3000/api/opiniones/valoracion/https%3A%2F%2Fdrive.google.com%2Ffile%2Fd%2F13DBqA252BfbCTaDJJOBXfqix6QypqQyB%2Fview%3Fusp%3Dsharing/4
/**
     * @swagger
     * /api/opiniones/valoracion/{enlace}/{valor}:
     *   get:
     *     summary: Obtener todas las opiniones de un libro con una valoración específica
     *     description: Obtiene todas las opiniones de un libro para una valoración específica (por ejemplo, todas las opiniones con una valoración de 4).
     *     parameters:
     *       - in: path
     *         name: enlace
     *         required: true
     *         description: Enlace único del libro
     *         schema:
     *           type: string
     *       - in: path
     *         name: valor
     *         required: true
     *         description: Valoración del libro (número entre 1 y 5)
     *         schema:
     *           type: integer
     *           minimum: 1
     *           maximum: 5
     *     responses:
     *       200:
     *         description: Lista de opiniones con la valoración solicitada
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Opinion'
     *       400:
     *         description: Valoración inválida (debe estar entre 1 y 5)
     *       404:
     *         description: Libro no encontrado
     *       500:
     *         description: Error al filtrar las opiniones
     */
router.get('/valoracion/:enlace/:valor', async (req, res) => {
    try {
        const enlace = decodeURIComponent(req.params.enlace);
        const valor = parseInt(req.params.valor, 10); 

        if (isNaN(valor) || valor < 1 || valor > 5) {
            return res.status(400).json({ 
                error: 'Valor inválido. Debe ser un número entre 1 y 5.' 
            });
        }

        const libro = await Libro.findOne({ where: { enlace } });
        if (!libro) {
            return res.status(404).json({ error: 'Libro no encontrado' });
        }

        const opiniones = await Opinion.findAll({
            where: {
                libro_id: enlace,
                valor
            }
        });

        return res.json(opiniones);

    } catch (error) {
        console.error('Error al filtrar opiniones:', error);
        return res.status(500).json({ 
            error: 'Error al filtrar opiniones', 
            detalle: error.message 
        });
    }
});

// OBTENER TODAS LAS VALORACIONES DE UN USUARIO, DADO UN USUARIO
/**
     * @swagger
     * /api/opiniones/usuario/{usuario_id}:
     *   get:
     *     summary: Obtener todas las opiniones de un usuario
     *     description: Retorna todas las opiniones de un usuario específico.
     *     parameters:
     *       - in: path
     *         name: usuario_id
     *         required: true
     *         description: Correo del usuario
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Lista de todas las opiniones del usuario
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Opinion'
     *       500:
     *         description: Error al obtener las opiniones del usuario
     */
router.get('/usuario/:usuario_id', async (req, res) => {
    try {
        const { usuario_id } = req.params;
        const opiniones = await obtenerOpinionesPorUsuario(usuario_id);
        res.status(200).json(opiniones);
    } catch (error) {
        console.error('Error al obtener opiniones:', error);
        res.status(500).json({ error: 'Error al obtener opiniones', detalle: error.message });
    }
});

// OBTENER TODAS LAS OPINIONES DADO UN ENLACE
// http://localhost:3000/api/opiniones/https%3A%2F%2Fdrive.google.com%2Ffile%2Fd%2F13DBqA252BfbCTaDJJOBXfqix6QypqQyB%2Fview%3Fusp%3Dsharing
// (porque debe estar codificado el enlace, luego abajo lo descodifico)
/**
     * @swagger
     * /api/opiniones/{enlace}:
     *   get:
     *     summary: Obtener todas las opiniones de un libro dado su enlace
     *     description: Obtiene todas las opiniones de un libro específico dado su enlace único.
     *     parameters:
     *       - in: path
     *         name: enlace
     *         required: true
     *         description: Enlace único del libro
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Lista de opiniones del libro
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Opinion'
     *       404:
     *         description: Libro no encontrado
     *       500:
     *         description: Error al obtener las opiniones
     */
router.get('/:enlace', async (req, res) => {
    try {
        console.log("Enlace recibido: ", req.params.enlace);
        const enlace = decodeURIComponent(req.params.enlace); 
        console.log("Enlace decodificado: ", enlace);

        const libro = await Libro.findOne({ where: { enlace } });
        console.log("Libro encontrado: ", libro);

        if (!libro) {
            return res.status(404).send('Libro no encontrado');
        }

        const opiniones = await Opinion.findAll({
            where: { libro_id: enlace } 
        });
        console.log("Opiniones encontradas: ", opiniones);

        res.json(opiniones);
    } catch (error) {
        console.error("Error al obtener las opiniones:", error);
        res.status(500).send('Error al obtener las opiniones');
    }
});

// PUBLICAR UNA NUEVA VALORACIÓN
// http://localhost:3000/api/opiniones
// {
//     "usuario_id": "locowin@gmail.com",
//     "libro_id": "https://drive.google.com/file/d/1pswnS2lR0dZzz7GkehnI5WmZZwRoRjc0/view?usp=sharing",
//     "titulo_resena": "Muy buen libro",
//     "mensaje": "Me encantó la narrativa y los personajes",
//     "valor": 5
// }

/**
     * @swagger
     * /api/opiniones:
     *   post:
     *     summary: Publicar una nueva valoración para un libro
     *     description: Permite a un usuario agregar una nueva valoración (opinión) para un libro.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               usuario_id:
     *                 type: string
     *               libro_id:
     *                 type: string
     *               titulo_resena:
     *                 type: string
     *               mensaje:
     *                 type: string
     *               valor:
     *                 type: integer
     *                 description: Valoración entre 1 y 5
     *             required:
     *               - usuario_id
     *               - libro_id
     *               - titulo_resena
     *               - mensaje
     *               - valor
     *     responses:
     *       201:
     *         description: Opinión agregada con éxito
     *       400:
     *         description: Datos faltantes o incorrectos
     *       500:
     *         description: Error al agregar la opinión
     */
router.post('/', async (req, res) => {
    try {
        const { usuario_id, libro_id, titulo_resena, mensaje, valor } = req.body;

        if (!usuario_id || !libro_id || !titulo_resena || !mensaje || valor === undefined) {
            return res.status(400).json({ error: 'Faltan datos requeridos' });
        }

        const libro = await Libro.findOne({ where: { enlace: libro_id } });
        if (!libro) {
            return res.status(400).json({ error: "El libro no existe." });
        }
          
        console.log('Datos recibidos para agregar opinión:', {
            usuario_id,
            libro_id,
            titulo_resena,
            mensaje,
            valor
        });
        const nuevaOpinion = await agregarOpinion({ usuario_id, libro_id, titulo_resena, mensaje, valor });
        res.status(201).json(nuevaOpinion);
    } catch (error) {
        console.error('Error al agregar opinión:', error);
        res.status(500).json({ error: 'Error al agregar opinión', detalle: error.message });
    }
});

module.exports = router;
