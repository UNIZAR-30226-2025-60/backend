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

//Ruta para obtener un libro en específico
router.get('/titulo/:titulo', async (req, res) => {
    const { titulo } = req.params;
    try {
        const libro = await Libro.findOne({ where: { nombre: titulo } });
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

module.exports = router;
