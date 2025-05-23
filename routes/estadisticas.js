// routes/estadisticas.js
const express = require('express');
const router = express.Router();
const { obtenerEstadisticasLibrosLeidosEnMes,  obtenerTop3UsuariosDelAnio, obtenerEstadisticasLibrosLeidosEnAños, obtenerEstadisticasGeneralesPorUsuario, obtenerTop3UsuariosDelMes, obtenerTop5LibrosDelMesYAnio, obtenerTop5LibrosDelAnio, obtenerLibrosRecomendadosSegunTematicas, obtenerTiempoTotalLeidoEnMes} = require('../models/Leido');  // IMPORTAR LA FUNCIÓN
const { User } = require('../models/User');  

// RUTA PARA OBTENER LOS 3 USUARIOS QUE MÁS HAN LEÍDO EL MES ACTUAL
// Probar: 
//   GET http://localhost:3000/api/estadisticas/top3

/**
 * @swagger
 * /api/estadisticas/top3:
 *   get:
 *     summary: Obtener los 3 usuarios que más han leído este mes
 *     description: Devuelve los 3 usuarios que más han leído libros en el mes actual.
 *     responses:
 *       200:
 *         description: Los 3 usuarios que más han leído en el mes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Error al obtener los 3 usuarios que más han leído del mes
 */
router.get('/top3', async (req, res) => {
    try {
        const usuariosTop3 = await obtenerTop3UsuariosDelMes();

        // if (usuariosTop3.length === 0) {
        //     return res.status(404).send('No se encontraron usuarios que hayan leído libros este mes.');
        // }

        res.json(usuariosTop3);

    } catch (error) {
        console.error('Error al obtener los 3 usuarios que más han leído del mes:', error);
        res.status(500).send('Error al obtener los 3 usuarios que más han leído del mes');
    }
});

// RUTA PARA OBTENER LOS 3 USUARIOS QUE MÁS HAN LEÍDO EN EL AÑO ACTUAL
// Probar:
//   GET http://localhost:3000/api/estadisticas/top3anuales

/**
 * @swagger
 * /api/estadisticas/top3anuales:
 *   get:
 *     summary: Obtener los 3 usuarios que más han leído este año
 *     description: Devuelve los 3 usuarios que más han leído libros en el año actual.
 *     responses:
 *       200:
 *         description: Los 3 usuarios que más han leído en el año
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Error al obtener los 3 usuarios que más han leído del año
 */
router.get('/top3anuales', async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();

        const usuariosTop3Anuales = await obtenerTop3UsuariosDelAnio(currentYear);

        // if (usuariosTop3Anuales.length === 0) {
        //     return res.status(404).send('No se encontraron usuarios que hayan leído libros este año.');
        // }

        res.json(usuariosTop3Anuales);

    } catch (error) {
        console.error('Error al obtener los 3 usuarios que más han leído en el año:', error);
        res.status(500).send('Error al obtener los 3 usuarios que más han leído en el año');
    }
});


// RUTA PARA OBTENER LOS 5 LIBROS QUE MÁS SE HAN LEÍDO DADO UN AÑO
// Probar: 
//   GET http://localhost:3000/api/estadisticas/top15libros/:year

/**
 * @swagger
 * /api/estadisticas/top5libros/{year}:
 *   get:
 *     summary: Obtener los 5 libros más leídos dado un año
 *     description: Devuelve los 5 libros más leídos en un año específico.
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         description: Año para obtener los libros más leídos
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Los 5 libros más leídos del año
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Error al obtener los 5 libros más leídos del año
 */
router.get('/top5libros/:year', async (req, res) => {
    const { year } = req.params;
    
    try {
        console.log(`Solicitando los 5 libros más leídos para el año: ${year}`);
        
        const librosTop5Anio = await obtenerTop5LibrosDelAnio(year);
        
        // if (librosTop5Anio.length === 0) {
        //     return res.status(404).send('No se encontraron libros leídos en este año.');
        // }

        res.json(librosTop5Anio);

    } catch (error) {
        console.error('Error al obtener los 5 libros más leídos del año:', error);
        res.status(500).send('Error al obtener los 5 libros más leídos del año');
    }
});


// RUTA PARA OBTENER LOS 5 LIBROS QUE MÁS SE HAN LEÍDO DADO UN MES Y UN AÑO
// Probar: 
//   GET http://localhost:3000/api/estadisticas/top15libros/:month/:year

/**
 * @swagger
 * /api/estadisticas/top5libros/{month}/{year}:
 *   get:
 *     summary: Obtener los 5 libros más leídos dado un mes y un año
 *     description: Retorna los 5 libros más leídos en un mes y año específicos.
 *     parameters:
 *       - in: path
 *         name: month
 *         required: true
 *         description: Mes para obtener los libros más leídos
 *         schema:
 *           type: integer
 *       - in: path
 *         name: year
 *         required: true
 *         description: Año para obtener los libros más leídos
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Los 5 libros más leídos del mes y año
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Error al obtener los 5 libros más leídos del mes y año
 */
router.get('/top5libros/:month/:year', async (req, res) => {
    const { month, year } = req.params;
    
    try {
        console.log(`Solicitando los 5 libros más leídos para el mes: ${month} y el año: ${year}`);
        
        const librosTop5 = await obtenerTop5LibrosDelMesYAnio(month, year);
        
        // if (librosTop5.length === 0) {
        //     return res.status(404).send('No se encontraron libros leídos en este mes y año.');
        // }

        res.json(librosTop5);

    } catch (error) {
        console.error('Error al obtener los 5 libros más leídos del mes y año:', error);
        res.status(500).send('Error al obtener los 5 libros más leídos del mes y año');
    }
});

// RUTA PARA OBTENER LOS DATOS GENERALES DE UN USUARIO
// Probar:
//   GET http://localhost:3000/api/estadisticas/generales/:correo

/**
 * @swagger
 * /api/estadisticas/generales/{correo}:
 *   get:
 *     summary: Obtener estadísticas generales de un usuario
 *     description: Devuelve las estadísticas generales de un usuario basado en su correo electrónico.
 *     parameters:
 *       - in: path
 *         name: correo
 *         required: true
 *         description: Correo del usuario para obtener sus estadísticas generales
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Estadísticas generales del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: Error al obtener las estadísticas generales del usuario
 */
router.get('/generales/:correo', async (req, res) => {
    const { correo } = req.params; // Obtenemos el correo del usuario desde los parámetros de la ruta

    try {
        const estadisticasGenerales = await obtenerEstadisticasGeneralesPorUsuario(correo);

        // if (!estadisticasGenerales) {
        //     return res.status(404).send('No se encontraron estadísticas para este usuario.');
        // }

        res.json(estadisticasGenerales);

    } catch (error) {
        console.error('Error al obtener las estadísticas generales del usuario:', error);
        res.status(500).send('Error al obtener las estadísticas generales del usuario');
    }
});


// RUTA PARA OBTENER LOS LIBROS RECOMENDADOS SEGÚN LAS TEMÁTICAS MÁS LEÍDAS POR EL USUARIO
// Probar: 
//   GET http://localhost:3000/api/estadisticas/librosrecomendados/:correo

/**
 * @swagger
 * /api/estadisticas/librosrecomendados/{correo}:
 *   get:
 *     summary: Obtener libros recomendados según las temáticas más leídas por el usuario
 *     description: Devuelve una lista de libros recomendados para un usuario basados en sus temáticas más leídas.
 *     parameters:
 *       - in: path
 *         name: correo
 *         required: true
 *         description: Correo del usuario para obtener los libros recomendados
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de libros recomendados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Error al obtener los libros recomendados
 */
router.get('/librosrecomendados/:correo', async (req, res) => {
    const { correo } = req.params;

    try {
        const librosRecomendados = await obtenerLibrosRecomendadosSegunTematicas(correo);

        // if (librosRecomendados.length === 0) {
        //     return res.status(404).send('No se encontraron libros recomendados.');
        // }

        res.json(librosRecomendados);

    } catch (error) {
        console.error('Error al obtener los libros recomendados:', error);
        res.status(500).send('Error al obtener los libros recomendados');
    }
});


// RUTA PARA OBTENER DE UN USUARIO SOBRE UN MES, DADO UN USUARIO:
//    - totalLibrosLeidos
//    - tematicas (de los libros leídos)
//    - librosLeidos (enlace, nombre, autor, fech_publ, resumen)
// Probar: 
//   GET http://localhost:3000/api/estadisticas/:usuario

/**
 * @swagger
 * /api/estadisticas/{correo}:
 *   get:
 *     summary: Obtener estadísticas de un usuario por mes
 *     description: Retorna las estadísticas de libros leídos por un usuario en un mes específico.
 *     parameters:
 *       - in: path
 *         name: correo
 *         required: true
 *         description: Correo del usuario
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Estadísticas del usuario para el mes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error al obtener las estadísticas
 */
router.get('/:correo', async (req, res) => {
    const { correo } = req.params;
    
    try {
        const usuarioExistente = await User.findOne({ where: { correo } });
        if (!usuarioExistente) {
            return res.status(404).send('Usuario no encontrado');
        }

        const fechaActual = new Date();
        const year = fechaActual.getFullYear(); 
        const month = fechaActual.getMonth() + 1;  

        const librosLeidos = await obtenerEstadisticasLibrosLeidosEnMes(correo, year, month);

        if (librosLeidos.mensaje) {
            return res.status(404).send(librosLeidos.mensaje);
        }

        const totalLibrosLeidos = librosLeidos.totalLibrosLeidos;
        const tematicas = librosLeidos.tematicas;

        res.json({
            totalLibrosLeidos,
            tematicas,
            librosLeidos: librosLeidos.librosLeidos,
        });

    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).send('Error al obtener estadísticas de libros leídos en el mes');
    }
});

// RUTA PARA OBTENER DE UN USUARIO, DADO UN USUARIO Y UN AÑO:
//    - libros_completados
//    - libros_en_progreso (falta darle una vuelta porque no sé cómo se guarda el inicio de cuando empieza a leer)
//    - tematicasMasLeidas (las 3 más leídas solo)
//    - librosMasValorados (los 5 libros valorados por un usuario en orden de mayor a menor puntuación media)
//    - librosLeidos (enlace, nombre, autor, fech_publ, resumen)
// Probar: 
//   GET http://localhost:3000/api/estadisticas/:usuario/:year

/**
 * @swagger
 * /api/estadisticas/{correo}/{year}:
 *   get:
 *     summary: Obtener estadísticas de lectura de un usuario para un año específico
 *     description: Obtiene estadísticas detalladas de lectura para un usuario, incluyendo libros completados, libros en progreso, temáticas más leídas, libros más valorados, y detalles de los libros leídos.
 *     parameters:
 *       - in: path
 *         name: correo
 *         required: true
 *         description: Correo electrónico del usuario cuya estadística se desea obtener
 *         schema:
 *           type: string
 *       - in: path
 *         name: year
 *         required: true
 *         description: Año para el cual se desean obtener las estadísticas de lectura
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Estadísticas detalladas de lectura del usuario para el año especificado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 libros_completados:
 *                   type: array
 *                   items:
 *                     type: object
 *                 libros_en_progreso:
 *                   type: array
 *                   items:
 *                     type: object
 *                 tematicasMasLeidas:
 *                   type: array
 *                   items:
 *                     type: string
 *                 librosMasValorados:
 *                   type: array
 *                   items:
 *                     type: object
 *                 librosLeidos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       enlace:
 *                         type: string
 *                       nombre:
 *                         type: string
 *                       autor:
 *                         type: string
 *                       fech_publ:
 *                         type: string
 *                         format: date
 *                       resumen:
 *                         type: string
 *       404:
 *         description: Usuario no encontrado o no hay estadísticas para el usuario en el año
 *       500:
 *         description: Error al obtener las estadísticas del usuario
 */
router.get('/:correo/:year', async (req, res) => {
    const { correo, year } = req.params;
    
    try {
        console.log('Solicitando estadísticas para el usuario:', correo, 'y año:', year);
        
        const usuarioExistente = await User.findOne({ where: { correo } });
        if (!usuarioExistente) {
            console.log('Usuario no encontrado');
            return res.status(404).send('Usuario no encontrado');
        }
        console.log('Usuario encontrado:', usuarioExistente);

        const estadisticas = await obtenerEstadisticasLibrosLeidosEnAños(correo, year);
        
        if (estadisticas.mensaje) {
            console.log('Mensaje:', estadisticas.mensaje);
            return res.status(404).send(estadisticas.mensaje);
        }

        console.log('Estadísticas obtenidas:', estadisticas);
        res.json(estadisticas);

    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).send('Error al obtener estadísticas de libros leídos en el año');
    }
});


// ESTO SERÍA SI AÑADIESEMOS LAS HORAS PARA UN USUARIO EN CONCRETO, EN UN MES, PORQUE SINO DEVUELVE LAS HORAS DEL LIBRO?
// router.get('/:correo/horasmes', async (req, res) => {
//     const { correo } = req.params;

//     try {
//         const usuarioExistente = await User.findOne({ where: { correo } });
//         if (!usuarioExistente) {
//             return res.status(404).send('Usuario no encontrado');
//         }

//         // Obtener el mes y año actuales
//         const currentDate = new Date();
//         const year = currentDate.getFullYear();  
//         const month = currentDate.getMonth() + 1; 

//         console.log('Mes actual:', month);
//         console.log('Año actual:', year);

//         // Obtener el tiempo total leído en el mes actual
//         const tiempoLeido = await obtenerTiempoTotalLeidoEnMes(correo, year, month);

//         res.json(tiempoLeido);

//     } catch (error) {
//         console.error('Error al obtener estadísticas:', error);
//         res.status(500).send('Error al obtener estadísticas de tiempo total leído en el mes');
//     }
// });


// ESTO SERÍA SI AÑADIESEMOS LAS HORAS PARA UN USUARIO EN CONCRETO, EN UN AÑO, PORQUE SINO DEVUELVE LAS HORAS DEL LIBRO?
// router.get('/:correo/horasanio', async (req, res) => {
//     const { correo } = req.params;

//     try {
//         const usuarioExistente = await User.findOne({ where: { correo } });
//         if (!usuarioExistente) {
//             return res.status(404).send('Usuario no encontrado');
//         }

//         const currentDate = new Date();
//         const year = currentDate.getFullYear(); 
//         const currentMonth = currentDate.getMonth();  

//         console.log('Año actual:', year);
//         console.log('Mes actual:', currentMonth + 1);

//         let totalHorasLeidas = 0;

//         for (let month = 0; month <= currentMonth; month++) {
//             const horasLeidasMes = await obtenerTiempoTotalLeidoEnMes(correo, year, month);
//             console.log(`Horas leídas en el mes ${month + 1}:`, horasLeidasMes);

//             totalHorasLeidas += horasLeidasMes;
//         }

//         res.json({ totalHorasLeidas });

//     } catch (error) {
//         console.error('Error al obtener estadísticas:', error);
//         res.status(500).send('Error al obtener estadísticas de tiempo total leído en el año');
//     }
// });

module.exports = router;
