const express = require('express');
const router = express.Router();
const { registrarUser } = require('../models/User');

router.post('/registro', async (req, res) => {
    console.log('Datos recibidos en el backend:', req.body);
    try {
        const result = await registrarUser(req.body);
        const user = result.rows[0];

        req.login(user, (err) => {
            if (err) {
                console.error('Error al iniciar sesión automáticamente:', err);
                return res.status(500).send('Error al iniciar sesión');
            }
            console.log('Usuario autenticado:', user);
            console.log('Sesión actual:', req.session);
            req.session.save((err) => {
                if (err) {
                    console.error('Error al guardar sesión:', err);
                    return res.status(500).send('Error al guardar sesión');
                }
                res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8081');
                res.setHeader('Access-Control-Allow-Credentials', 'true');
                res.status(201).json(user); 
            });
        });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).send(`Error al registrar usuario, ${error.message}`);
    }
});

module.exports = router;
