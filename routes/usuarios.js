const express = require('express');
const router = express.Router();
const pool = require('../db/db');

router.post('/registro', async (req, res) => {
    const { nombre, correo, contrasena } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO USUARIO (nombre, correo, contrasena) VALUES ($1, $2, $3) RETURNING *',
            [nombre, correo, contrasena]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).send('Error al registrar usuario');
    }
});

module.exports = router;
