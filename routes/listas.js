const express = require('express');
const router = express.Router();
const { Lista } = require('../models/Listas');
const { pool } = require('../db/db');

// RUTA PARA OBTENER LOS LIBROS DE "MIS FAVORITOS" DADO UN USUARIO
// Probar: 
//  GET http://localhost:3000/api/listas/favoritos/:usuario_id
router.get('/favoritos/:usuario_id', async (req, res) => {
    const usuario_id = req.params.usuario_id;

    try {
        const query = `
            SELECT lb.enlace_libro, l.nombre AS nombre_lista
            FROM libros_lista lb
            INNER JOIN lista l
            ON lb.usuario_id = l.usuario_id AND lb.nombre_lista = l.nombre
            WHERE l.usuario_id = $1 AND l.nombre = 'Mis Favoritos';
        `;

        console.log('Ejecutando consulta SQL:', query, 'con usuario_id:', usuario_id);

        // Ejecutamos la consulta
        const { rows } = await pool.query(query, [usuario_id]);
        console.log('Resultados obtenidos:', rows);

        if (rows.length === 0) {
            return res.status(404).send('No se encontraron libros en la lista "Mis Favoritos".');
        }

        // Devolvemos los resultados
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener los libros de "Mis Favoritos":', error);
        res.status(500).send('Error interno del servidor');
    }
});

// RUTA PARA AÑADIR UN LIBRO A "MIS FAVORITOS"
// Probar: 
//  POST http://localhost:3000/api/listas/favoritos
//  BODY: 
    // {
    //     "usuario_id": "el correo de un usuario",
    //     "enlace_libro": "https://...enlace_libro"
    //  }
router.post('/favoritos', async (req, res) => {
    const { usuario_id, enlace_libro } = req.body;

    try {
        if (!usuario_id || !enlace_libro) {
            return res.status(400).send('Faltan parámetros: usuario_id o enlace_libro.');
        }

        const query = `
            INSERT INTO libros_lista (usuario_id, nombre_lista, enlace_libro)
            VALUES ($1, 'Mis Favoritos', $2)
            RETURNING *;
        `;

        const { rows } = await pool.query(query, [usuario_id, enlace_libro]);

        res.status(201).json({
            mensaje: 'Libro añadido a la lista "Mis Favoritos".',
            favorito: rows[0],
        });
    } catch (error) {
        console.error('Error al añadir libro a "Mis Favoritos":', error);
        if (error.code === '23505') {
            return res.status(409).send('El libro ya está en la lista "Mis Favoritos".');
        }
        res.status(500).send('Error interno del servidor');
    }
});

// RUTA PARA ELIMINAR UN LIBRO DE "MIS FAVORITOS"
// Probar: 
//   DELETE http://localhost:3000/api/listas/favoritos
//   BODY:
    // {
    //     "usuario_id": "el correo de un usuario",
    //     "enlace_libro": "https://...enlace_libro"
    //  }
router.delete('/favoritos', async (req, res) => {
    const { usuario_id, enlace_libro } = req.body;

    try {
        if (!usuario_id || !enlace_libro) {
            return res.status(400).send('Faltan parámetros: usuario_id o enlace_libro.');
        }

        const query = `
            DELETE FROM libros_lista
            WHERE usuario_id = $1 AND nombre_lista = 'Mis Favoritos' AND enlace_libro = $2
            RETURNING *;
        `;

        const { rows } = await pool.query(query, [usuario_id, enlace_libro]);

        if (rows.length === 0) {
            return res.status(404).send('El libro no se encuentra en la lista "Mis Favoritos".');
        }

        res.json({
            mensaje: 'Libro eliminado de la lista "Mis Favoritos".',
            eliminado: rows[0],
        });
    } catch (error) {
        console.error('Error al eliminar libro de "Mis Favoritos":', error);
        res.status(500).send('Error interno del servidor');
    }
});


// RUTA PARA OBTENER TODAS LAS LISTAS PÚBLICAS
// Probar: 
//   GET http://localhost:3000/api/listas/publicas
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

// RUTA PARA OBTENER TODOS LOS LIBROS DADA UN NOMBRE DE UN USUARIO Y SU NOMBRE DE LA LISTA
// Probar: 
//   GET http://localhost:3000/api/listas/:usuario_id/:nombre_lista/libros
router.get('/:usuario_id/:nombre_lista/libros', async (req, res) => {
    const { usuario_id, nombre_lista } = req.params;

    try {
        console.log('Usuario ID:', usuario_id);
        console.log('Nombre de la lista:', nombre_lista);

        const query = `
            SELECT lb.enlace_libro, l.nombre AS nombre_lista
            FROM libros_lista lb
            INNER JOIN lista l
            ON lb.usuario_id = l.usuario_id AND lb.nombre_lista = l.nombre
            WHERE l.usuario_id = $1 AND l.nombre = $2;
        `;

        console.log('Ejecutando consulta SQL:', query);

        const { rows } = await pool.query(query, [usuario_id, nombre_lista]);

        if (rows.length === 0) {
            return res.status(404).send('No se encontraron libros para la lista especificada.');
        }

        res.json(rows); 
    } catch (error) {
        console.error('Error al obtener los libros de la lista:', error);
        res.status(500).send('Error interno del servidor');
    }
});

// RUTA PARA OBTENER TODAS LAS LISTAS DADO UN USUARIO
// Probar: 
//   GET http://localhost:3000/api/listas/:usuario_id
router.get('/:usuario_id', async (req, res) => {
    try {
        const usuario_id = req.params.usuario_id;

        const listas = await Lista.findAll({
            where: { usuario_id: usuario_id }, 
            attributes: ['nombre', 'descripcion', 'publica', 'portada'] 
        });

        if (listas.length === 0) {
            return res.status(404).send(`No se encontraron listas para el usuario: ${usuario_id}`);
        }

        res.json(listas); 
    } catch (error) {
        console.error('Error al obtener las listas:', error);
        res.status(500).send('Error al obtener las listas');
    }
});

// RUTA PARA OBTENER LOS ATRIBUTOS DE UNA LISTA DADO EL NOMBRE DEL USUARIO Y SU NOMBRE DE LA LISTA
// Probar: 
//   GET http://localhost:3000/api/listas/:usuario_id/:nombre
router.get('/:usuario_id/:nombre', async (req, res) => {
    const { usuario_id, nombre } = req.params;

    try {
        const lista = await Lista.findOne({
            where: {
                usuario_id: usuario_id,
                nombre: nombre
            },
            attributes: ['nombre', 'descripcion', 'publica', 'portada'] 
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



// RUTA PARA ACTUALIZAR ATRIBUTOS DADO UN NOMBRE DE USUARIO Y SU NOMBRE DE LISTA
// Probar: 
//   PATCH http://localhost:3000/api/listas/:usuario_id/:nombre
//   BODY:
    // {
    //     "descripcion": "el correo de un usuario",
    //     "publica": "true",
    //     "portada": "https:..."
    //  }
    // OJO, al ser modificar, puedes poner los atributos que te de
    // la gana para modificar, como si pones solo uno.
router.patch('/:usuario_id/:nombre', async (req, res) => {
    const { usuario_id, nombre } = req.params;
    const camposParaActualizar = {};

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


// RUTA PARA CREAR UNA NUEVA LISTA
// Probar: 
//   POST http://localhost:3000/api/listas
//   BODY:
    // {
    //     "nombre": "Mi Nueva Lista",
    //     "usuario_id": "usuario@correo.com",
    //     "descripcion": "Descripción de la nueva lista",
    //     "publica": true,
    //     "portada": "https:..."
    // }
router.post('/', async (req, res) => {
    try {
        const { nombre, usuario_id, descripcion, publica, portada } = req.body;

        const nuevaLista = await Lista.create({
            nombre,
            usuario_id,
            descripcion,
            publica,
            portada
        });

        res.status(201).json(nuevaLista); 
    } catch (error) {
        console.error('Error al crear la lista:', error);
        res.status(500).send('Error al crear la lista');
    }
});

// RUTA PARA ELIMINAR UNA LISTA
// Probar: 
//   DELETE http://localhost:3000/api/listas/:usuario_id/:nombre
router.delete('/:usuario_id/:nombre', async (req, res) => {
    try {
        const { usuario_id, nombre } = req.params;

        if (nombre === 'Mis Favoritos') {
            return res.status(400).send('No se puede eliminar la lista "Mis Favoritos".');
        }

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
