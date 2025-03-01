const express = require('express');
const router = express.Router();
const { Libro } = require('../models/Libro');
const { Opinion , agregarOpinion , obtenerOpinionesPorUsuario } = require('../models/Opiniones');


// OBTENER TODAS LAS OPINIONES DADO UN LIBRO Y UNA VALORACIÓN (ej, para un libro, todas las reseñas que tienen un 4 como valoración)
//http://localhost:3000/api/opiniones/valoracion/https%3A%2F%2Fdrive.google.com%2Ffile%2Fd%2F13DBqA252BfbCTaDJJOBXfqix6QypqQyB%2Fview%3Fusp%3Dsharing/4
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
