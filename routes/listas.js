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

// RUTA PARA OBTENER LOS ATRIBUTOS DE UNA LISTA PÚBLICA DADO SU NOMBRE
// Probar: 
//   GET http://localhost:3000/api/listas/publicas/:nombre
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


// RUTA PARA OBTENER TODAS LAS LISTAS DADO UN USUARIO Y UN LIBRO
// Probar:
//   GET http://localhost:3000/api/listas/:usuario_id/:enlace_libro/listas
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

module.exports = router;
