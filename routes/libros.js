// ESTO ES LO VUESTRO (A MÍ (ARIANA), NO ME FUNCIONA)
// const express = require('express');
// const router = express.Router();
// const pool = require('../db/db');

// router.get('/', async (req, res) => {
//     try {
//         const result = await pool.query('SELECT * FROM LIBRO');
//         res.json(result.rows);
//     } catch (error) {
//         console.error("ERROR EN BACK AL OBTENER LOS LIBROS:", error);
//         res.status(500).send('Error al obtener libros');
//     }
// });

// ESTO SÍ ME FUNCIONA
// routes/libros.js
const express = require('express');
const router = express.Router();
const { Libro, obtenerLibrosPorTematica } = require('../models/Libro');  // Importar el modelo Libro
const { Tema } = require('../models/Tema');  // Importar el modelo Tema
const { Op } = require('sequelize');
const { User } = require('../models/User');
const { Leido, obtenerLibrosLeidosPorUsuario  } = require('../models/Leido');

// Ruta para obtener todos los libros
router.get('/', async (req, res) => {
    try {
        const libros = await Libro.findAll();  // Usar Sequelize para obtener todos los libros
        res.json(libros);
        } catch (error) {
            res.status(500).send('Error al obtener libros');
        }
    });


//Ruta para obtener un libro en específico
router.get('/titulo/:titulo', async (req, res) => {
    const { titulo } = req.params;
    try {
        const libro = await Libro.findAll({ where: { nombre: { [Op.like]: `%${titulo}%`  } } });
        if(libro) {
            res.json(libro);
        }
    } catch (error) {
        res.status(500).send('Error al obtener libro');
    }
});


// Ruta para obtener todas las tematicas de libros
router.get('/tematicas', async (req, res) => {
    try {
        const tematicas = await Tema.findAll();
        res.json(tematicas);
        
    } catch (error) {
        res.status(500).send('Error al obtener tematicas de libros');
    }
});

// Ruta para obtener libros por temática
router.get('/tematica/:tematica', async (req, res) => {
    const { tematica } = req.params;
    try {
        const libros = await obtenerLibrosPorTematica(tematica);
        res.json(libros);
    } catch (error) {
        res.status(500).send('Error al obtener libros por temática');
    }
});

// Ruta para obtener todos los libros de un autor
router.get('/autor/:autor', async (req, res) => {
    const { autor } = req.params;
    try {
        const libros = await Libro.findAll({ where: { autor: autor } });
        res.json(libros);
    } catch (error) {
        res.status(500).send('Error al obtener libros');
    }
});

// Ruta para obtener todos los libros leídos por un usuario
router.get('/leidos/:correo', async (req, res) => {
    const { correo } = req.params;

    try {
        // 1. Verificar si el usuario existe
        const usuarioExistente = await User.findOne({ where: { correo } });
        if (!usuarioExistente) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // 2. Obtener los libros leídos por el usuario
        const librosLeidos = await obtenerLibrosLeidosPorUsuario(correo);

        // 3. Retornar los libros leídos
        res.json(librosLeidos);
        
    } catch (error) {
        console.error("Error al obtener libros leídos:", error);
        res.status(500).send('Error al obtener libros leídos');
    }
});

module.exports = router;
