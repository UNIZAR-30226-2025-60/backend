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
const { Libro } = require('../models/Libro');  // Importar el modelo Libro

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
        const libro = await Libro.findOne({ where: { nombre: titulo } });
        if(libro) {
            res.json(libro);
        }
    } catch (error) {
        res.status(500).send('Error al obtener libro');
    }
});

//Ruta para obtener todos los libros de una categoría
router.get('/categoria/:categoria', async (req, res) => {
    const { categoria } = req.params;
    try {
        const libros = await Libro.findAll({ where: { categoria: categoria } });
        res.json(libros);
    } catch (error) {
        res.status(500).send('Error al obtener libros');
    }
});

//Ruta para obtener todos los libros de una categoría
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
