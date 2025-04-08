const express = require('express');
const router = express.Router();
const { Fragmento } = require('../models/Fragmento');
const { Libro } = require('../models/Libro');
const { User } = require('../models/User');

// Ruta para obtener los fragmentos destacados de un usuario para un libro específico
/**
 * @swagger
 * /api/fragmentos/obtenerFragmentos:
 *   get:
 *     summary: Obtener fragmentos destacados de un usuario para un libro específico
 *     description: Devuelve los fragmentos destacados de un usuario para un libro específico, basado en el correo del usuario y el enlace del libro.
 *     parameters:
 *       - in: query
 *         name: correo
 *         required: true
 *         description: Correo electrónico del usuario
 *         schema:
 *           type: string
 *       - in: query
 *         name: enlace
 *         required: true
 *         description: Enlace del libro
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de fragmentos destacados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       404:
 *         description: Usuario o libro no encontrado
 *       500:
 *         description: Error al obtener fragmentos destacados
 */
router.get('/obtenerFragmentos', async (req, res) => {
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
/**
 * @swagger
 * /api/fragmentos:
 *   post:
 *     summary: Insertar un fragmento destacado
 *     description: Permite a un usuario agregar un fragmento destacado para un libro específico.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               correo:
 *                 type: string
 *                 description: Correo electrónico del usuario
 *               enlace:
 *                 type: string
 *                 description: Enlace del libro
 *               pagina:
 *                 type: integer
 *                 description: Página del libro que se marca como fragmento destacado
 *     responses:
 *       201:
 *         description: Fragmento destacado agregado con éxito
 *       400:
 *         description: La página no es válida (fuera de rango)
 *       404:
 *         description: Usuario o libro no encontrado
 *       500:
 *         description: Error al agregar fragmento destacado
 */
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
/**
 * @swagger
 * /api/fragmentos:
 *   delete:
 *     summary: Eliminar un fragmento destacado
 *     description: Permite a un usuario eliminar un fragmento destacado dado un correo, enlace y página.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               correo:
 *                 type: string
 *                 description: Correo electrónico del usuario
 *               enlace:
 *                 type: string
 *                 description: Enlace del libro
 *               pagina:
 *                 type: integer
 *                 description: Página del libro que se desea eliminar
 *     responses:
 *       200:
 *         description: Fragmento eliminado con éxito
 *       404:
 *         description: Usuario, libro o fragmento no encontrado
 *       500:
 *         description: Error al eliminar fragmento
 */
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
