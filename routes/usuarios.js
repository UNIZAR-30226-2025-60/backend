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

router.post('/registro', async (req, res) => {
    console.log('Datos recibidos en el backend:', req.body);
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

        req.login(newUser, (err) => {
            if (err) {
                console.error('Error al iniciar sesión automáticamente:', err);
                return res.status(500).send('Error al iniciar sesión');
            }
            console.log('Usuario autenticado:', newUser);
            console.log('Sesión actual:', req.session);
            req.session.save((err) => {
                if (err) {
                    console.error('Error al guardar sesión:', err);
                    return res.status(500).send('Error al guardar sesión');
                }
                res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8081');
                res.setHeader('Access-Control-Allow-Credentials', 'true');
                res.status(201).json({ usuario: newUser, listaFavoritos: listaResult.rows[0] });
            });
        });
    } catch (error) {
        console.error('Error al registrar usuario y crear lista de favoritos:', error);
        res.status(500).send('Error al registrar usuario: ' + error.message);
    }
});

module.exports = router;
