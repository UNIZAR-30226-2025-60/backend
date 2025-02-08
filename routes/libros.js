const express = require('express');
const router = express.Router();
const pool = require('../db/db');

router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM LIBRO');
        res.json(result.rows);
    } catch (error) {
        res.status(500).send('Error al obtener libros');
    }
});

module.exports = router;
