const express = require('express');
const router = express.Router();
const { Lista } = require('../models/Listas');
const { pool } = require('../db/db');

// RUTA PARA OBTENER LOS LIBROS DE "MIS FAVORITOS" DADO UN USUARIO
// Probar: 
//  GET http://localhost:3000/api/listas/favoritos/:usuario_id

/**
 * @swagger
 * /api/listas/favoritos/{usuario_id}:
 *   get:
 *     summary: Obtener los libros de "Mis Favoritos" de un usuario
 *     description: Devuelve todos los libros de la lista "Mis Favoritos" de un usuario específico.
 *     parameters:
 *       - in: path
 *         name: usuario_id
 *         required: true
 *         description: Correo o ID del usuario
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de libros favoritos del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       404:
 *         description: No se encontraron libros en la lista "Mis Favoritos"
 *       500:
 *         description: Error al obtener los libros favoritos
 */
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

        const { rows } = await pool.query(query, [usuario_id]);
        console.log('Resultados obtenidos:', rows);

        // if (rows.length === 0) {
        //     return res.status(404).json({ error: true, message: 'No se encontraron libros en la lista "Mis Favoritos".' });
        // }
        if (rows.length === 0) {
            return res.json([]); // Respuesta con un array vacío
        }

        res.json(rows);
    } catch (error) {
        console.error('Error al obtener los libros de "Mis Favoritos":', error);
        res.status(500).send('Error interno del servidor');
    }
});

// RUTA PARA OBTENER TODAS LAS PORTADAS DE LIBROS Y SUS TEMÁTICAS
// Probar:
//      GET http://localhost:3000/api/listas/portadas-temas

/**
 * @swagger
 * /api/listas/portadas-temas:
 *   get:
 *     summary: Obtener todas las portadas de libros y sus temáticas
 *     description: Devuelve las URLs de todas las portadas de libros almacenadas en la base de datos.
 *     responses:
 *       200:
 *         description: Lista de imágenes de portadas de libros
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   foto:
 *                     type: string
 *       500:
 *         description: Error al obtener las portadas de libros
 */
router.get('/portadas-temas', async (req, res) => {
    try {
      const query = `
        SELECT im.url AS foto
        FROM IMAGEN im
      `;
      const { rows } = await pool.query(query);
      res.json(rows);
    } catch (error) {
      console.error('Error al obtener fotos de perfil:', error);
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

 /**
 * @swagger
 * /api/listas/favoritos:
 *   post:
 *     summary: Añadir un libro a "Mis Favoritos"
 *     description: Permite a un usuario añadir un libro a su lista de "Mis Favoritos".
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               usuario_id:
 *                 type: string
 *               enlace_libro:
 *                 type: string
 *     responses:
 *       201:
 *         description: Libro añadido correctamente a la lista "Mis Favoritos"
 *       400:
 *         description: Faltan parámetros requeridos o libro no existe
 *       409:
 *         description: El libro ya está en la lista "Mis Favoritos"
 *       500:
 *         description: Error al añadir el libro a "Mis Favoritos"
 */
router.post('/favoritos', async (req, res) => {
    const { usuario_id, enlace_libro } = req.body;

    try {
        if (!usuario_id || !enlace_libro) {
            return res.status(400).send('Faltan parámetros: usuario_id o enlace_libro.');
        }

        const query = `
            INSERT INTO libros_lista (usuario_id, nombre_lista, enlace_libro)
            VALUES ($1, 'Mis Favoritos', $2)
            ON CONFLICT (usuario_id, nombre_lista, enlace_libro) DO NOTHING
            RETURNING *;
        `;

        const { rows } = await pool.query(query, [usuario_id, enlace_libro]);

        if (rows.length === 0) {
            return res.status(409).send('El libro ya está en la lista "Mis Favoritos".');
        }

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

// RUTA PARA OBTENER TODAS LAS LISTAS PÚBLICAS
// Probar: 
//   GET http://localhost:3000/api/listas/publicas

/**
 * @swagger
 * /api/listas/publicas:
 *   get:
 *     summary: Obtener todas las listas públicas
 *     description: Devuelve todas las listas que son públicas.
 *     responses:
 *       200:
 *         description: Lista de listas públicas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       404:
 *         description: No se encontraron listas públicas
 *       500:
 *         description: Error al obtener las listas públicas
 */
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


// RUTA PARA ELIMINAR UN LIBRO DE "MIS FAVORITOS"
// Probar: 
//   DELETE http://localhost:3000/api/listas/favoritos
//   BODY:
    // {
    //     "usuario_id": "el correo de un usuario",
    //     "enlace_libro": "https://...enlace_libro"
    //  }

/**
 * @swagger
 * /api/listas/favoritos:
 *   delete:
 *     summary: Eliminar un libro de "Mis Favoritos"
 *     description: Permite a un usuario eliminar un libro de su lista "Mis Favoritos".
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               usuario_id:
 *                 type: string
 *               enlace_libro:
 *                 type: string
 *     responses:
 *       200:
 *         description: Libro eliminado correctamente de "Mis Favoritos"
 *       400:
 *         description: Faltan parámetros requeridos o el libro no existe
 *       404:
 *         description: El libro no se encuentra en la lista "Mis Favoritos"
 *       500:
 *         description: Error al eliminar el libro de "Mis Favoritos"
 */
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


///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////


// RUTA PARA OBTENER TODOS LOS LIBROS DADA UN NOMBRE DE UN USUARIO Y SU NOMBRE DE LA LISTA
// Probar: 
//   GET http://localhost:3000/api/listas/:usuario_id/:nombre_lista/libros

/**
 * @swagger
 * /api/listas/{usuario_id}/{nombre_lista}/libros:
 *   get:
 *     summary: Obtener todos los libros de una lista de un usuario
 *     description: Obtiene todos los libros de una lista específica de un usuario dado el nombre de la lista y el usuario_id.
 *     parameters:
 *       - in: path
 *         name: usuario_id
 *         required: true
 *         description: ID o correo del usuario
 *         schema:
 *           type: string
 *       - in: path
 *         name: nombre_lista
 *         required: true
 *         description: Nombre de la lista de libros
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de libros obtenidos de la lista especificada
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Error interno del servidor
 */
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

        // if (rows.length === 0) {
        //     return res.status(404).send('No se encontraron libros para la lista especificada.');
        // }

        res.json(rows); 
    } catch (error) {
        console.error('Error al obtener los libros de la lista:', error);
        res.status(500).send('Error interno del servidor');
    }
});

// RUTA PARA OBTENER LOS ATRIBUTOS DE UNA LISTA PÚBLICA DADO SU NOMBRE
// Probar: 
//   GET http://localhost:3000/api/listas/publicas/:nombre
/**
 * @swagger
 * /api/listas/publicas/{nombre}:
 *   get:
 *     summary: Obtener los atributos de una lista pública dada su nombre
 *     description: Obtiene los detalles de una lista pública, como el nombre, descripción, visibilidad pública y portada, utilizando el nombre de la lista.
 *     parameters:
 *       - in: path
 *         name: nombre
 *         required: true
 *         description: El nombre de la lista pública que se desea obtener
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalles de la lista pública encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 nombre:
 *                   type: string
 *                   description: El nombre de la lista
 *                 descripcion:
 *                   type: string
 *                   description: Descripción de la lista
 *                 publica:
 *                   type: boolean
 *                   description: Indica si la lista es pública
 *                 portada:
 *                   type: string
 *                   description: URL de la portada de la lista
 *       404:
 *         description: Lista no encontrada
 *       500:
 *         description: Error al obtener los detalles de la lista
 */
router.get('/publicas/:nombre', async (req, res) => {
    const { nombre } = req.params;

    try {
        const lista = await Lista.findOne({
            where: {
                nombre: nombre,
                publica: true
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

// RUTA PARA OBTENER LOS ATRIBUTOS DE UNA LISTA DADO EL NOMBRE DEL USUARIO Y SU NOMBRE DE LA LISTA
// Probar: 
//   GET http://localhost:3000/api/listas/:usuario_id/:nombre

/**
 * @swagger
 * /api/listas/{usuario_id}/{nombre}:
 *   get:
 *     summary: Obtener los atributos de una lista de un usuario
 *     description: Obtiene los detalles de una lista de un usuario, como su nombre, descripción, estado de privacidad y portada.
 *     parameters:
 *       - in: path
 *         name: usuario_id
 *         required: true
 *         description: ID o correo del usuario
 *         schema:
 *           type: string
 *       - in: path
 *         name: nombre
 *         required: true
 *         description: Nombre de la lista
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalles de la lista
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 nombre:
 *                   type: string
 *                 descripcion:
 *                   type: string
 *                 publica:
 *                   type: boolean
 *                 portada:
 *                   type: string
 *       404:
 *         description: Lista no encontrada
 *       500:
 *         description: Error interno del servidor
 */
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


// RUTA PARA OBTENER TODAS LAS LISTAS DADO UN USUARIO
// Probar: 
//   GET http://localhost:3000/api/listas/:usuario_id

/**
 * @swagger
 * /api/listas/{usuario_id}:
 *   get:
 *     summary: Obtener todas las listas de un usuario
 *     description: Obtiene todas las listas asociadas a un usuario dado su ID o correo.
 *     parameters:
 *       - in: path
 *         name: usuario_id
 *         required: true
 *         description: ID o correo del usuario
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de todas las listas del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       404:
 *         description: No se encontraron listas para el usuario
 *       500:
 *         description: Error al obtener las listas
 */
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


// RUTA PARA ACTUALIZAR ATRIBUTOS DADO UN NOMBRE DE USUARIO Y SU NOMBRE DE LISTA
// Probar: 
//   PATCH http://localhost:3000/api/listas/:usuario_id/:nombre
//   BODY:
    // {
    //     "descripcion": "el correo de un usuario",
    //     "publica": "true",
    //     "portada": "https:...",
    //     "nuevoNombre": "NOMBRELISTAANUEVO"
    //  }
    // OJO, al ser modificar, puedes poner los atributos que te de
    // la gana para modificar, como si pones solo uno.
/**
 * @swagger
 * /api/listas/{usuario_id}/{nombre}:
 *   patch:
 *     summary: Actualizar los atributos de una lista
 *     description: Actualiza los atributos de una lista específica de un usuario, como descripción, visibilidad, portada, y nombre.
 *     parameters:
 *       - in: path
 *         name: usuario_id
 *         required: true
 *         description: ID o correo del usuario
 *         schema:
 *           type: string
 *       - in: path
 *         name: nombre
 *         required: true
 *         description: Nombre de la lista que se desea actualizar
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               descripcion:
 *                 type: string
 *               publica:
 *                 type: boolean
 *               portada:
 *                 type: string
 *               nuevoNombre:
 *                 type: string
 *     responses:
 *       200:
 *         description: Lista actualizada correctamente
 *       400:
 *         description: No se proporcionaron campos para actualizar
 *       404:
 *         description: Lista no encontrada
 *       500:
 *         description: Error al actualizar la lista
 */
    router.patch('/:usuario_id/:nombre', async (req, res) => {
        const { usuario_id, nombre } = req.params;
        const { descripcion, publica, portada, nuevoNombre } = req.body;
        const camposParaActualizar = {};
    
        if (descripcion !== undefined) {
            camposParaActualizar.descripcion = descripcion;
        }
        if (publica !== undefined) {
            camposParaActualizar.publica = publica;
        }
        if (portada !== undefined) {
            camposParaActualizar.portada = portada;
        }
        if (nuevoNombre !== undefined) {
            // Se actualiza el nombre en la tabla "lista"
            camposParaActualizar.nombre = nuevoNombre;
        }
    
        if (Object.keys(camposParaActualizar).length === 0) {
            return res.status(400).json({ error: 'No se ha proporcionado ningún campo para actualizar.' });
        }
    
        try {
            // Actualizamos SOLO la tabla lista -> ON UPDATE CASCADE propagará el cambio a libros_lista
            const resultado = await Lista.update(camposParaActualizar, {
                where: { usuario_id, nombre }
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
        

// RUTA PARA AÑADIR UN LIBRO A UNA LISTA DE UN USUARIO
// Probar: 
//   POST http://localhost:3000/api/listas/:nombreLista
//   BODY: 
//     {
//       "usuario_id": "el correo de un usuario",
//       "libro_id": "https://...enlace_libro"
//     }
/**
 * @swagger
 * /api/listas/{nombreLista}:
 *   post:
 *     summary: Añadir un libro a una lista de un usuario
 *     description: Permite a un usuario añadir un libro a una lista especificada por el nombre de la lista.
 *     parameters:
 *       - in: path
 *         name: nombreLista
 *         required: true
 *         description: Nombre de la lista a la que se desea añadir el libro
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               usuario_id:
 *                 type: string
 *               libro_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: Libro añadido correctamente a la lista
 *       400:
 *         description: Faltan parámetros requeridos
 *       409:
 *         description: El libro ya está en la lista
 *       500:
 *         description: Error interno del servidor
 */
router.post('/:nombreLista', async (req, res) => {
    const { usuario_id, libro_id } = req.body;
    const { nombreLista } = req.params;

    try {
        if (!usuario_id || !libro_id) {
            return res.status(400).send('Faltan parámetros: usuario_id o libro_id');
        }
        if (!nombreLista) {
            return res.status(400).send('Falta nombre de la lista.');
        }

        const query = `
            INSERT INTO libros_lista (usuario_id, nombre_lista, enlace_libro)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;

        const { rows } = await pool.query(query, [usuario_id, nombreLista, libro_id]);

        res.status(201).json({
            mensaje: `Libro añadido a la lista "${nombreLista}".`,
            libro: rows[0],
        });
    } catch (error) {
        console.error('Error al añadir libro a la lista:', error);
        if (error.code === '23505') {  
            return res.status(409).send(`El libro ya está en la lista "${nombreLista}".`);
        }
        res.status(500).send('Error interno del servidor');
    }
});


// RUTA PARA ELIMINAR UN LIBRO DADO UN USUARIO Y UNA LISTA
// Probar: 
//   DELETE http://localhost:3000/api/listas/:nombreLista
//   BODY:
//     {
//       "usuario_id": "el correo de un usuario",
//       "libro_id": "https://...enlace_libro"
//     }
/**
 * @swagger
 * /api/listas/{nombreLista}:
 *   delete:
 *     summary: Eliminar un libro de una lista
 *     description: Permite a un usuario eliminar un libro de una lista específica. Se debe proporcionar el usuario_id, libro_id y nombre de la lista.
 *     parameters:
 *       - in: path
 *         name: nombreLista
 *         required: true
 *         description: Nombre de la lista de donde se eliminará el libro
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               usuario_id:
 *                 type: string
 *               libro_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Libro eliminado correctamente de la lista
 *       400:
 *         description: Faltan parámetros requeridos o el libro no existe
 *       404:
 *         description: El libro no se encuentra en la lista
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:nombreLista', async (req, res) => {
    const { usuario_id, libro_id } = req.body;
    const { nombreLista } = req.params;

    try {
        if (!usuario_id || !libro_id || !nombreLista) {
            return res.status(400).send('Faltan parámetros: usuario_id o libro_id');
        }

        if (!nombreLista) {
            return res.status(400).send('Falta el nombre de la lista');
        }

        const query = `
            DELETE FROM libros_lista
            WHERE usuario_id = $1 AND nombre_lista = $2 AND enlace_libro = $3
            RETURNING *;
        `;

        const { rows } = await pool.query(query, [usuario_id, nombreLista, libro_id]);

        if (rows.length === 0) {
            return res.status(404).send(`El libro no se encuentra en la lista "${nombreLista}".`);
        }

        res.json({
            mensaje: `Libro eliminado de la lista "${nombreLista}".`,
            eliminado: rows[0],
        });
    } catch (error) {
        console.error('Error al eliminar libro de la lista:', error);
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
/**
 * @swagger
 * /api/listas:
 *   post:
 *     summary: Crear una nueva lista
 *     description: Crea una nueva lista para un usuario con la información proporcionada.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               usuario_id:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               publica:
 *                 type: boolean
 *               portada:
 *                 type: string
 *     responses:
 *       201:
 *         description: Lista creada correctamente
 *       500:
 *         description: Error al crear la lista
 */
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
/**
 * @swagger
 * /api/listas/{usuario_id}/{nombre}:
 *   delete:
 *     summary: Eliminar una lista de un usuario
 *     description: Permite eliminar una lista de un usuario específico. No se puede eliminar la lista "Mis Favoritos".
 *     parameters:
 *       - in: path
 *         name: usuario_id
 *         required: true
 *         description: ID del usuario que posee la lista
 *         schema:
 *           type: string
 *       - in: path
 *         name: nombre
 *         required: true
 *         description: Nombre de la lista que se desea eliminar
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista eliminada correctamente
 *       400:
 *         description: No se puede eliminar la lista "Mis Favoritos"
 *       404:
 *         description: Lista no encontrada
 *       500:
 *         description: Error interno del servidor
 */
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


// RUTA PARA OBTENER TODAS LAS LISTAS DADO UN USUARIO Y UN LIBRO
// Probar:
//   GET http://localhost:3000/api/:usuario_id/:enlace_libro/listas

/**
 * @swagger
 * /api/listas/{usuario_id}/{enlace_libro}/listas:
 *   get:
 *     summary: Obtener todas las listas de un usuario para un libro específico
 *     description: Obtiene todas las listas en las que un usuario ha agregado un libro específico.
 *     parameters:
 *       - in: path
 *         name: usuario_id
 *         required: true
 *         description: ID o correo del usuario
 *         schema:
 *           type: string
 *       - in: path
 *         name: enlace_libro
 *         required: true
 *         description: Enlace único del libro
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de listas donde el libro está presente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       404:
 *         description: No se encontraron listas para el usuario y el libro
 *       500:
 *         description: Error al obtener las listas
 */
router.get('/:usuario_id/:enlace_libro/listas', async (req, res) => {
    const { usuario_id, enlace_libro } = req.params;

    try {
        const query = `
            SELECT l.nombre AS nombre_lista, l.descripcion, l.publica, l.portada
            FROM lista l
            INNER JOIN libros_lista lb ON l.usuario_id = lb.usuario_id AND l.nombre = lb.nombre_lista
            WHERE l.usuario_id = $1 AND lb.enlace_libro = $2;
        `;

        console.log('Ejecutando consulta SQL:', query);

        const { rows } = await pool.query(query, [usuario_id, enlace_libro]);

        if (rows.length === 0) {
            return res.status(404).send('No se encontraron listas para el usuario y el libro especificados.');
        }

        res.json(rows);
    } catch (error) {
        console.error('Error al obtener las listas del usuario y el libro:', error);
        res.status(500).send('Error interno del servidor');
    }
});


// RUTA PARA OBTENER LOS LIBROS DE UNA LISTA PÚBLICA ESPECÍFICA
// Probar: 
//   GET http://localhost:3000/api/listas/publicas/:nombre/librosP
/**
 * @swagger
 * /api/listas/publicas/{nombre}/librosP:
 *   get:
 *     summary: Obtener los libros de una lista pública dada su nombre
 *     description: Obtiene los enlaces de los libros que están en una lista pública, dado su nombre.
 *     parameters:
 *       - in: path
 *         name: nombre
 *         required: true
 *         description: El nombre de la lista pública de la cual se desea obtener los libros.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de libros de la lista pública
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   enlace_libro:
 *                     type: string
 *                     description: Enlace del libro en la lista pública
 *       500:
 *         description: Error al obtener los libros de la lista pública
 */

router.get('/publicas/:nombre/librosP', async (req, res) => {
    const { nombre } = req.params;
    try {
        const query = `
            SELECT lb.enlace_libro
            FROM libros_lista lb
            INNER JOIN lista l ON lb.usuario_id = l.usuario_id AND lb.nombre_lista = l.nombre
            WHERE l.nombre = $1 AND l.publica = true;
        `;
        const { rows } = await pool.query(query, [nombre]);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener los libros de la lista pública:', error);
        res.status(500).send('Error interno del servidor');
    }
});




module.exports = router;
