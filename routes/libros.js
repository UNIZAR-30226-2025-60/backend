// routes/libros.js
const express = require('express');
const router = express.Router();
const { Libro, obtenerLibrosPorTematica, obtenerLibrosPorTematicaYTitulo, obtenerLibrosEnProcesoPorUsuario } = require('../models/Libro');  // Importar el modelo Libro
const { Tema } = require('../models/Tema');  // Importar el modelo Tema
const { Op } = require('sequelize');
const { User } = require('../models/User');
const { Leido, obtenerLibrosLeidosPorUsuario  } = require('../models/Leido');
const { sequelize } = require('../db/db');


// Ruta para obtener todos los libros
/**
 * * @swagger
 * /api/libros:
 *  get:
 *      summary: Obtener todos los libros
 *      description: Devuelve una lista de todos los libros disponibles en la base de datos.
 *      responses:
 *      200:
 *         description: Lista de libros
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Libro'
 *       500:
 *         description: Error al obtener los libros
 */
router.get('/', async (req, res) => {
    try {
        const libros = await Libro.findAll();  // Usar Sequelize para obtener todos los libros
        res.json(libros);
    } catch (error) {
        res.status(500).send('Error al obtener libros');
    }
});


//Ruta para obtener un libro en específico en la lupa (este codigo es mejor para la busqueda de libros)
/**
     * @swagger
     * /api/libros/obtenerTitulo/{titulo}:
     *   get:
     *     summary: Buscar libros por título
     *     description: Busca libros cuyo título coincida parcialmente con el parámetro proporcionado.
     *     parameters:
     *       - in: path
     *         name: titulo
     *         required: true
     *         description: Título del libro a buscar
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Lista de libros encontrados
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Libro'
     *       404:
     *         description: No se encontraron libros con ese título
     *       500:
     *         description: Error al obtener el libro
     */
 router.get('/obtenerTitulo/:titulo', async (req, res) => {
     const { titulo } = req.params;
     try {
         const libros = await Libro.findAll({
             where: { nombre: { [Op.iLike]: `%${titulo}%` } } 
         });
         if(libros.length > 0) {
             res.json(libros);
         } else {
             res.status(404).send('No se encontraron libros');
         }
     } catch (error) {
         console.error('Error al obtener libro:', error);
         res.status(500).send('Error al obtener libro');
     }
 });


//Ruta para obtener info de un libro (al clickar un libro, se muestran los detalles del libro)
/**
 * @swagger
 * /api/libros/titulo/{titulo}:
 *   get:
 *     summary: Obtener detalles de un libro por su título
 *     description: Retorna la información detallada de un libro específico al hacer clic sobre él.
 *     parameters:
 *       - in: path
 *         name: titulo
 *         required: true
 *         description: Título del libro
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalles del libro
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Libro'
 *       500:
 *         description: Error al obtener el libro
 */
router.get('/titulo/:titulo', async (req, res) => {
    const { titulo } = req.params;
    try {
        const libro = await Libro.findOne({ where: { nombre: titulo } });
        if(libro) {
            await libro.update({ contador_lecturas: libro.contador_lecturas + 1});
            
            //Y envío al front los detalles del libro, con el número de visitias actualizado
            res.json(libro);
        }
    } catch (error) {
        res.status(500).send('Error al obtener libro');
    }
});

//Ruta para obtener los 4 libros más populares
/**
 * @swagger
 * /api/libros/librosPopulares:
 *   get:
 *     summary: Obtener los 4 libros más populares
 *     description: Devuelve los 4 libros más populares, basados en el número de lecturas.
 *     responses:
 *       200:
 *         description: Los 4 libros más populares
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Libro'
 *       500:
 *         description: Error al obtener los libros populares
 */
router.get('/librosPopulares', async (req, res) => {
    try {
        const libros = await Libro.findAll({ order: [['contador_lecturas', 'DESC']], limit: 4 });
        res.json(libros);
    } catch (error) {
        res.status(500).send('Error al obtener los 4 libros más populares');
    }
});

//Ruta para obtener los todos los libros (en orden según el número de visitas)
/**
 * @swagger
 * /api/libros/librosOrdenados:
 *   get:
 *     summary: Obtener libros ordenados por número de visitas
 *     description: Devuelve todos los libros ordenados por el número de lecturas en orden descendente.
 *     responses:
 *       200:
 *         description: Lista de libros ordenados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Libro'
 *       500:
 *         description: Error al obtener los libros ordenados
 */
router.get('/librosOrdenados', async (req, res) => {
    try {
        const libros = await Libro.findAll({ order: [['contador_lecturas', 'DESC']]});
        res.json(libros);
    } catch (error) {
        res.status(500).send('Error al obtener los libros ordenados');
    }
});

// Ruta para obtener todas las tematicas de libros
/**
 * @swagger
 * /api/libros/tematicas:
 *   get:
 *     summary: Obtener todas las temáticas de libros
 *     description: Devuelve todas las temáticas disponibles para los libros.
 *     responses:
 *       200:
 *         description: Lista de temáticas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   nombre:
 *                     type: string
 *                   descripcion:
 *                     type: string
 *       500:
 *         description: Error al obtener las temáticas
 */
router.get('/tematicas', async (req, res) => {
    try {
        const tematicas = await Tema.findAll();
        res.json(tematicas);
        
    } catch (error) {
        res.status(500).send('Error al obtener tematicas de libros');
    }
});

// Ruta para obtener libros por temática
/**
 * @swagger
 * /api/libros/tematica/{tematica}:
 *   get:
 *     summary: Obtener libros por temática
 *     description: Devuelve los libros asociados a una temática específica.
 *     parameters:
 *       - in: path
 *         name: tematica
 *         required: true
 *         description: Nombre de la temática
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de libros por temática
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Libro'
 *       500:
 *         description: Error al obtener libros por temática
 */
router.get('/tematica/:tematica', async (req, res) => {
    const { tematica } = req.params;
    try {
        const libros = await obtenerLibrosPorTematica(tematica);
        res.json(libros);
    } catch (error) {
        res.status(500).send('Error al obtener libros por temática');
    }
});

// Ruta para obtener libros por temática y titulo en buscador
/**
 * @swagger
 * /api/libros/tematicaTitulo/{tematica}/{titulo}:
 *   get:
 *     summary: Obtener libros por temática y título
 *     description: Devuelve libros asociados a una temática y que contengan un título específico.
 *     parameters:
 *       - in: path
 *         name: tematica
 *         required: true
 *         description: Nombre de la temática
 *         schema:
 *           type: string
 *       - in: path
 *         name: titulo
 *         required: true
 *         description: Título del libro
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de libros por temática y título
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Libro'
 *       500:
 *         description: Error al obtener libros por temática y título
 */
router.get('/tematicaTitulo/:tematica/:titulo', async (req, res) => {
    const { tematica, titulo } = req.params;
    try {
        const libros = await obtenerLibrosPorTematicaYTitulo(tematica, titulo);
        res.json(libros);
    } catch (error) {
        res.status(500).send('Error al obtener libros por temática y nombre');
    }
});

// Ruta para obtener todos los libros de un autor
/**
 * @swagger
 * /api/libros/autor/{autor}:
 *   get:
 *     summary: Obtener libros por autor
 *     description: Devuelve todos los libros escritos por un autor específico.
 *     parameters:
 *       - in: path
 *         name: autor
 *         required: true
 *         description: Nombre del autor
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de libros de un autor
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Libro'
 *       500:
 *         description: Error al obtener libros del autor
 */
router.get('/autor/:autor', async (req, res) => {
    const { autor } = req.params;
    try {
        const libros = await Libro.findAll({ where: { autor: autor } });
        res.json(libros);
    } catch (error) {
        res.status(500).send('Error al obtener libros');
    }
});

// Ruta para obtener todos los libros leídos por un usuario
/**
 * @swagger
 * /api/libros/leidos/{correo}:
 *   get:
 *     summary: Obtener libros leídos por un usuario
 *     description: Devuelve una lista de todos los libros que un usuario ha leído.
 *     parameters:
 *       - in: path
 *         name: correo
 *         required: true
 *         description: Correo electrónico del usuario
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de libros leídos por el usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Libro'
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error al obtener los libros leídos
 */
router.get('/leidos/:correo', async (req, res) => {
    const { correo } = req.params;

    try {
        // 1. Verificar si el usuario existe
        const usuarioExistente = await User.findOne({ where: { correo } });
        if (!usuarioExistente) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // 2. Obtener los libros leídos por el usuario
        const librosLeidos = await obtenerLibrosLeidosPorUsuario(correo);

        // 3. Retornar los libros leídos
        res.json(librosLeidos);
        
    } catch (error) {
        console.error("Error al obtener libros leídos:", error);
        res.status(500).send('Error al obtener libros leídos');
    }
});

// Ruta para añadir un libro de un usuario a leidos
/**
 * @swagger
 * /api/leidos:
 *   post:
 *     summary: Añadir un libro de un usuario a "Leídos"
 *     description: Permite a un usuario marcar un libro como leído, moverlo de "En Proceso" a "Leídos" y agregarlo a la lista de libros leídos del usuario.
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
 *                 description: Enlace único del libro
 *     responses:
 *       201:
 *         description: Libro agregado correctamente a "Leídos" y "libros_lista", y eliminado de "En Proceso"
 *       400:
 *         description: Correo o enlace no proporcionados correctamente
 *       404:
 *         description: Usuario o libro no encontrado
 *       500:
 *         description: Error al agregar el libro a "Leídos" o eliminarlo de "En Proceso"
 */

router.post('/leidos', async (req, res) => {
    const { correo, enlace } = req.body;
    try {
        if (!correo || !enlace) {            
            return res.status(400).json({ error: 'Correo o enlace no proporcionados correctamente' });
        }

        // 1. Verificar si el usuario existe
        const usuarioResult = await sequelize.query("SELECT * FROM usuario WHERE correo = :correo", { 
            replacements: { correo } 
        });
        if (usuarioResult[0].length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // 2. Verificar si el libro existe
        const libroResult = await sequelize.query("SELECT * FROM libro WHERE enlace = :enlace", { 
            replacements: { enlace } 
        });
        if (libroResult[0].length === 0) {
            return res.status(404).json({ error: 'Libro no encontrado' });
        }

        // 3. Insertar el libro en la tabla "leidos"
        const insertQuery = `
            INSERT INTO leidos (usuario_id, libro_id, fecha_fin_lectura)
            VALUES (:correo, :enlace, NOW()) 
            ON CONFLICT (usuario_id, libro_id) 
            DO UPDATE SET fecha_fin_lectura = NOW();
        `;
        
        await sequelize.query(insertQuery, { replacements: { correo, enlace } });

         // 4. Insertar el libro en la tabla "libros_lista"
         const insertLibrosListaQuery = `
         INSERT INTO libros_lista (usuario_id, nombre_lista, enlace_libro)
         VALUES (:correo, 'Leídos', :enlace);
         `;
     
         await sequelize.query(insertLibrosListaQuery, { replacements: { correo, enlace } });

        // 5. Eliminar el libro de la tabla "en_proceso"
        const deleteQuery = `
            DELETE FROM en_proceso 
            WHERE usuario_id = :correo AND libro_id = :enlace;
        `;
        
        await sequelize.query(deleteQuery, { replacements: { correo, enlace } });

        res.status(201).json({ message: 'Libro agregado a "Leídos" y "libros_lista" y eliminado de "En Proceso" correctamente' });
        
    } catch (error) {
        console.error('❌ Error al agregar libro a "Leídos" o eliminarlo de "En Proceso":', error);
        res.status(500).json({ error: `Error al agregar libro a "Leídos": ${error.message}` });
    }
});




// Ruta para obtener los libros en proceso de un usuario
/**
 * @swagger
 * /api/libros/enproceso/{correo}:
 *   get:
 *     summary: Obtener libros en proceso por un usuario
 *     description: Devuelve los libros que un usuario está leyendo actualmente.
 *     parameters:
 *       - in: path
 *         name: correo
 *         required: true
 *         description: Correo electrónico del usuario
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de libros en proceso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Libro'
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error al obtener los libros en proceso
 */
router.get('/enproceso/:correo', async (req, res) => {
    const { correo } = req.params;
    try {
      const usuarioExistente = await User.findOne({ where: { correo } });
      if (!usuarioExistente) return res.status(404).json({ error: 'Usuario no encontrado' });
  
      const librosEnProceso = await obtenerLibrosEnProcesoPorUsuario(correo);
      res.json(librosEnProceso);
    } catch (error) {
      console.error('Error al obtener libros en proceso:', error);
      res.status(500).send('Error al obtener libros en proceso');
    }
});


// Ruta para guardar un libro en proceso
/**
 * @swagger
 * /api/libros/enproceso:
 *   post:
 *     summary: Guardar un libro en proceso de lectura
 *     description: Permite a un usuario guardar el progreso de un libro que está leyendo actualmente.
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
 *                 description: Número de la página en la que está el usuario
 *     responses:
 *       201:
 *         description: Libro guardado en proceso correctamente
 *       400:
 *         description: La página no está en el rango permitido
 *       404:
 *         description: Usuario o libro no encontrado
 *       500:
 *         description: Error al guardar el libro en proceso
 */
router.post('/enproceso', async (req, res) => {
    const { correo, enlace, pagina } = req.body;

    try {
        const usuarioExistente = await User.findOne({ where: { correo } });
        if (!usuarioExistente) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const libroExistente = await Libro.findOne({ where: { enlace } });
        if (!libroExistente) {
            return res.status(404).json({ error: 'Libro no encontrado' });
        }

        if (pagina <=0 || pagina > libroExistente.num_paginas) {
            return res.status(400).json({ error: `La página debe estar entre 1 y ${libroExistente.num_paginas}` });
        }

        // Usar UPSERT o UPDATE
        const [libroEnProceso, created] = await sequelize.query(
            `INSERT INTO en_proceso (usuario_id, libro_id, pagina)
            VALUES (:correo, :enlace, :pagina)
            ON CONFLICT (usuario_id, libro_id) DO UPDATE
            SET pagina = :pagina`,
            { replacements: { correo, enlace, pagina } }
        );

        res.status(201).json({ message: 'Libro guardado en proceso correctamente' });
    } catch(error) {
        console.error('Error al guardar libro en proceso:', error);
        res.status(500).json({ error: 'Error al guardar libro en proceso' });
    }
});


// Ruta para eliminar un libro en proceso de un usuario
/**
 * @swagger
 * /api/libros/enproceso:
 *   delete:
 *     summary: Eliminar un libro en proceso de un usuario
 *     description: Permite a un usuario eliminar un libro de la lista "En Proceso". El libro será eliminado de la tabla correspondiente si el usuario y el libro existen.
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
 *                 description: Enlace único del libro
 *     responses:
 *       200:
 *         description: Libro eliminado correctamente de "En Proceso"
 *       404:
 *         description: Usuario o libro no encontrado o el libro no estaba en proceso
 *       500:
 *         description: Error al eliminar el libro de "En Proceso"
 */

router.delete('/enproceso', async (req, res) => {
    const { correo, enlace } = req.body;

    try {
        const usuarioExistente = await User.findOne({ where: { correo } });
        if (!usuarioExistente) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const libroExistente = await Libro.findOne({ where: { enlace } });
        if (!libroExistente) {
            return res.status(404).json({ error: 'Libro no encontrado' });
        }

        // Buscar si el libro está en proceso para este usuario
        const libroEnProceso = await sequelize.query(
            `DELETE FROM en_proceso WHERE usuario_id = :correo AND libro_id = :enlace`,
            { replacements: { correo, enlace } }
        );

        if (libroEnProceso[1] === 0) {
            return res.status(404).json({ error: 'El libro no estaba en proceso' });
        }

        res.status(200).json({ message: 'Libro eliminado del proceso correctamente' });
    } catch (error) {
        console.error('Error al eliminar libro en proceso:', error);
        res.status(500).json({ error: 'Error al eliminar libro en proceso' });
    }
});



// Ruta para obtener los libros dado su clave primaria enlace
//Se le llama desde front asi:
// const libroId = encodeURIComponent(this.$route.params.id);
// axios.get(`${API_URL}/libros/libro/${libroId}`)
//     .then(response => console.log(response.data))
//     .catch(error => console.error(error));

/**
 * @swagger
 * /api/libros/libro/{enlace}:
 *   get:
 *     summary: Obtener un libro por su enlace
 *     description: Devuelve un libro específico dado su enlace único.
 *     parameters:
 *       - in: path
 *         name: enlace
 *         required: true
 *         description: Enlace único del libro
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalles del libro
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Libro'
 *       404:
 *         description: Libro no encontrado
 *       500:
 *         description: Error al obtener el libro
 */
router.get('/libro/:enlace', async (req, res) => {
    try {
        const enlace = decodeURIComponent(req.params.enlace).trim(); // Decodifica URL y elimina espacios extra
        console.log("Buscando libro con enlace:", enlace);

        const libro = await Libro.findOne({ where: { enlace } });

        if (!libro) {
            return res.status(404).json({ error: 'Libro no encontrado' });
        }

        res.json(libro);
    } catch (error) {
        console.error('Error al obtener atributos del libro:', error);
        res.status(500).json({ error: 'Error al obtener el libro' });
    }
});


module.exports = router;
