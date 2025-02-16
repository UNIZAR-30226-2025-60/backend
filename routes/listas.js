const express = require('express');
const router = express.Router();
const { Lista } = require('../models/Listas');

// Ruta para obtener los libros de la lista "Mis favoritos" de un usuario específico
router.get('/listas/favoritos/:usuario_id', async (req, res) => {
    const usuario_id = req.params.usuario_id;
    console.log('Usuario ID:', usuario_id);  // Verificar que el ID es recibido correctamente

    try {
        const query = `
            SELECT nombre, descripcion, publica, portada
            FROM lista
            WHERE usuario_id = $1 AND nombre = 'Mis Favoritos';
        `;
        console.log('Ejecutando consulta:', query);
        const { rows } = await pool.query(query, [usuario_id]);
        console.log('Resultados:', rows);

        if (rows.length === 0) {
            return res.status(404).send('Lista no encontrada.');
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error en la ruta de favoritos:', error);
        res.status(500).send('Error interno del servidor');
    }
});




// Ruta para obtener todas las listas públicas
router.get('/publicas', async (req, res) => {
    try {
        const listasPublicas = await Lista.findAll({
            where: { publica: true },
            attributes: ['nombre', 'descripcion', 'usuario_id', 'portada']
        });

        if (listasPublicas.length === 0) {
            return res.status(404).send('No se encontraron listas públicas.');
        }

        res.json(listasPublicas);
    } catch (error) {
        console.error('Error al obtener las listas públicas:', error);
        res.status(500).send('Error al obtener las listas públicas');
    }
});

// Ruta para obtener todas las listas de un usuario dado su `usuario_id`
router.get('/:usuario_id', async (req, res) => {
    try {
        const usuario_id = req.params.usuario_id;

        // Buscar las listas asociadas al usuario
        const listas = await Lista.findAll({
            where: { usuario_id: usuario_id }, // Filtro por el usuario_id
            attributes: ['nombre', 'descripcion', 'publica', 'portada'] // Campos a devolver
        });

        if (listas.length === 0) {
            return res.status(404).send(`No se encontraron listas para el usuario: ${usuario_id}`);
        }

        res.json(listas); // Devolver las listas en formato JSON
    } catch (error) {
        console.error('Error al obtener las listas:', error);
        res.status(500).send('Error al obtener las listas');
    }
});

// Ruta para obtener los atributos de una lista específica dado el usuario y el nombre de la lista
router.get('/:usuario_id/:nombre', async (req, res) => {
    const { usuario_id, nombre } = req.params;

    try {
        const lista = await Lista.findOne({
            where: {
                usuario_id: usuario_id,
                nombre: nombre
            },
            attributes: ['nombre', 'descripcion', 'publica', 'portada'] // Los atributos que quieres devolver
        });

        if (!lista) {
            return res.status(404).send('Lista no encontrada.');
        }

        res.json(lista);
    } catch (error) {
        console.error('Error al obtener los detalles de la lista:', error);
        res.status(500).send('Error interno del servidor');
    }
});



// Ruta para actualizar atributos de una lista específica
router.patch('/:usuario_id/:nombre', async (req, res) => {
    const { usuario_id, nombre } = req.params;
    const camposParaActualizar = {};

    // Verifica qué campos están presentes en el body y agrégalos al objeto de actualización
    if (req.body.descripcion !== undefined) {
        camposParaActualizar.descripcion = req.body.descripcion;
    }
    if (req.body.publica !== undefined) {
        camposParaActualizar.publica = req.body.publica;
    }
    if (req.body.portada !== undefined) {
        camposParaActualizar.portada = req.body.portada;
    }

    try {
        const resultado = await Lista.update(camposParaActualizar, {
            where: { usuario_id: usuario_id, nombre: nombre }
        });

        if (resultado[0] === 0) {
            return res.status(404).send('Lista no encontrada o sin cambios.');
        }

        res.send('Lista actualizada correctamente.');
    } catch (error) {
        console.error('Error al actualizar la lista:', error);
        res.status(500).send('Error interno del servidor');
    }
});


// Ruta para crear una nueva lista
router.post('/', async (req, res) => {
    try {
        const { nombre, usuario_id, descripcion, publica, portada } = req.body;

        // Crear la nueva lista
        const nuevaLista = await Lista.create({
            nombre,
            usuario_id,
            descripcion,
            publica,
            portada
        });

        res.status(201).json(nuevaLista); // Devolver la lista creada
    } catch (error) {
        console.error('Error al crear la lista:', error);
        res.status(500).send('Error al crear la lista');
    }
});

// Ruta para eliminar una lista
router.delete('/:usuario_id/:nombre', async (req, res) => {
    try {
        const { usuario_id, nombre } = req.params;

        // Eliminar la lista con las claves primarias especificadas
        const resultado = await Lista.destroy({
            where: { usuario_id: usuario_id, nombre: nombre }
        });

        if (resultado === 0) {
            return res.status(404).send('Lista no encontrada.');
        }

        res.send('Lista eliminada con éxito.');
    } catch (error) {
        console.error('Error al eliminar la lista:', error);
        res.status(500).send('Error al eliminar la lista');
    }
});

module.exports = router;
