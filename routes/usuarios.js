const express = require('express');
const router = express.Router();
const { pool } = require('../db/db');

router.post('/registro', async (req, res) => {
    console.log('Datos recibidos en el backend:', req.body);  // Verificar datos recibidos
    const { correo, nombre, contrasena } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO usuario ( correo, nombre, contrasena) VALUES ($1, $2, $3) RETURNING *',
            [correo, nombre, contrasena]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).send(`Error al registrar usuario, ${error.message}`);
    }
});

module.exports = router;
