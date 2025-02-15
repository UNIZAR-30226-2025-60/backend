const express = require('express');
const router = express.Router();
const { pool } = require('../db/db');

const { registrarUser } = require('../models/User');

router.post('/registro', async (req, res) => {
    console.log('Datos recibidos en el backend:', req.body);  // Verificar datos recibidos
    try {
        const result = await registrarUser(req.body);

        // Iniciar sesión automáticamente después del registro
        const user = result.rows[0];
        req.login(user, (err) => {
            if (err) {
                console.error('Error al iniciar sesión automáticamente:', err);
                return res.status(500).send('Error al iniciar sesión');
            }
            req.session.save((err) => {
                if (err) {
                    console.error('Error al guardar sesión:', err);
                    return res.status(500).send('Error al guardar sesión');
                }
            res.status(201).json(user);
            });
        });
    } catch (error) {
        res.status(500).send(`Error al registrar usuario, ${error.message}`);
    }
});

module.exports = router;