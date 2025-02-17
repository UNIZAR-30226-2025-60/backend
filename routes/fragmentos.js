const express = require('express');
const router = express.Router();
const { Fragmento } = require('../models/Fragmento');
const { Libro } = require('../models/Libro');
const { User } = require('../models/User');

// Ruta para obtener los fragmentos destacados de un usuario para un libro específico
router.get('/', async (req, res) => {
    const { correo, enlace } = req.query;

    try {
        // 1. Verificar si el usuario existe
        const usuario = await User.findOne({ where: { correo } });
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // 2. Verificar si el libro existe
        const libro = await Libro.findOne({ where: { enlace } });
        if (!libro) {
            return res.status(404).json({ error: 'Libro no encontrado' });
        }

        // 3. Obtener los fragmentos destacados para ese usuario y libro
        const fragmentos = await Fragmento.findAll({
            where: {
                correo: usuario.correo,
                enlace: libro.enlace
            }
        });

        // 4. Retornar los fragmentos
        res.json(fragmentos);

    } catch (error) {
        console.error('Error al obtener fragmentos destacados:', error);
        res.status(500).json({ error: 'Error al obtener fragmentos destacados' });
    }
});

// Ruta para insertar un fragmento destacado dado un correo, enlace y página
router.post('/', async (req, res) => {
    const { correo, enlace, pagina } = req.body;

    try {
        // 1. Verificar si el usuario existe
        const usuario = await User.findOne({ where: { correo } });
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // 2. Verificar si el libro existe
        const libro = await Libro.findOne({ where: { enlace } });
        if (!libro) {
            return res.status(404).json({ error: 'Libro no encontrado' });
        }

        // 3. Verificar si la página es válida
        if (pagina <= 0 || pagina > libro.num_paginas) {
            return res.status(400).json({ error: `La página debe estar entre 1 y ${libro.num_paginas}` });
        }

        // 4. Insertar el fragmento destacado en la base de datos
        await Fragmento.create({
            correo: usuario.correo,
            enlace: libro.enlace,
            pagina: pagina
        });

        res.status(201).json({ message: 'Fragmento destacado agregado exitosamente' });

    } catch (error) {
        console.error('Error al agregar fragmento destacado:', error);
        res.status(500).json({ error: 'Error al agregar fragmento destacado' });
    }
});

// Ruta para eliminar un fragmento dado un correo, enlace y página
router.delete('/', async (req, res) => {
    const { correo, enlace, pagina } = req.body;

    try {
        // 1. Verificar si el usuario existe
        const usuario = await User.findOne({ where: { correo } });
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // 2. Verificar si el libro existe
        const libro = await Libro.findOne({ where: { enlace } });
        if (!libro) {
            return res.status(404).json({ error: 'Libro no encontrado' });
        }

        // 3. Verificar si el fragmento existe
        const fragmento = await Fragmento.findOne({
            where: {
                correo: usuario.correo,
                enlace: libro.enlace,
                pagina: pagina
            }
        });

        if (!fragmento) {
            return res.status(404).json({ error: 'Fragmento no encontrado' });
        }

        // 4. Eliminar el fragmento
        await fragmento.destroy();

        res.status(200).json({ message: 'Fragmento eliminado exitosamente' });

    } catch (error) {
        console.error('Error al eliminar fragmento:', error);
        res.status(500).json({ error: 'Error al eliminar fragmento' });
    }
});

module.exports = router;
