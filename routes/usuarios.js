const express = require('express');
const router = express.Router();
const { pool } = require('../db/db');

const { registrarUser } = require('../models/User');

// router.post('/registro', async (req, res) => {
//     const { nombre, correo, contrasena } = req.body;
//     try {
//         const result = await pool.query(
//             'INSERT INTO USUARIO (nombre, correo, contrasena) VALUES ($1, $2, $3) RETURNING *',
//             [nombre, correo, contrasena]
//         );
//         res.status(201).json(result.rows[0]);
//     } catch (error) {
//         res.status(500).send('Error al registrar usuario');
//     }
// });

// // Registro que también cree a la vez la lista de "Mis favoritos" para ese usuario
router.post('/registro', async (req, res) => {
    const { nombre, correo, contrasena } = req.body;
    try {
        const userResult = await pool.query(
            'INSERT INTO USUARIO (nombre, correo, contrasena) VALUES ($1, $2, $3) RETURNING *',
            [nombre, correo, contrasena]
        );
        const newUser = userResult.rows[0];

        const listaResult = await pool.query(
            'INSERT INTO LISTA (nombre, usuario_id, publica, descripcion) VALUES ($1, $2, $3, $4) RETURNING *',
            ['Mis Favoritos', newUser.correo, false, 'Tu lista personal de favoritos']
        );
        const nuevaListaFavoritos = listaResult.rows[0];

        res.status(201).json({ usuario: newUser, listaFavoritos: nuevaListaFavoritos });
    } catch (error) {
        console.error('Error al registrar el usuario y crear lista de favoritos:', error);
        res.status(500).send('Error al registrar usuario: ' + error.message); // Enviar el mensaje de error al cliente puede ayudar durante el desarrollo
    }
});


module.exports = router;