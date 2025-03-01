// routes/libros.js
const express = require('express');
const router = express.Router();
const { Libro, obtenerLibrosPorTematica, obtenerLibrosPorTematicaYTitulo, obtenerLibrosEnProcesoPorUsuario } = require('../models/Libro');  // Importar el modelo Libro
const { Tema } = require('../models/Tema');  // Importar el modelo Tema
const { Op } = require('sequelize');
const { User } = require('../models/User');
const { Leido, obtenerLibrosLeidosPorUsuario  } = require('../models/Leido');

// Ruta para obtener todos los libros
router.get('/', async (req, res) => {
    try {
        const libros = await Libro.findAll();  // Usar Sequelize para obtener todos los libros
        res.json(libros);
    } catch (error) {
        res.status(500).send('Error al obtener libros');
    }
});


//Ruta para obtener un libro en específico en la lupa (este codigo es mejor para la busqueda de libros)
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
router.get('/librosPopulares', async (req, res) => {
    try {
        const libros = await Libro.findAll({ order: [['contador_lecturas', 'DESC']], limit: 4 });
        res.json(libros);
    } catch (error) {
        res.status(500).send('Error al obtener los 4 libros más populares');
    }
});

//Ruta para obtener los todos los libros (en orden según el número de visitas)
router.get('/librosOrdenados', async (req, res) => {
    try {
        const libros = await Libro.findAll({ order: [['contador_lecturas', 'DESC']]});
        res.json(libros);
    } catch (error) {
        res.status(500).send('Error al obtener los libros ordenados');
    }
});

// Ruta para obtener todas las tematicas de libros
router.get('/tematicas', async (req, res) => {
    try {
        const tematicas = await Tema.findAll();
        res.json(tematicas);
        
    } catch (error) {
        res.status(500).send('Error al obtener tematicas de libros');
    }
});

// Ruta para obtener libros por temática
router.get('/tematica/:tematica', async (req, res) => {
    const { tematica } = req.params;
    try {
        const libros = await obtenerLibrosPorTematica(tematica);
        res.json(libros);
    } catch (error) {
        res.status(500).send('Error al obtener libros por temática');
    }
});

// Ruta para obtener libros por temática y tirulo en buscador
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


// Ruta para obtener los libros en proceso de un usuario
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

// Ruta para obtener los libros dado su clave primaria enlace
//Se le llama desde front asi:
// const libroId = encodeURIComponent(this.$route.params.id);
// axios.get(`${API_URL}/libros/libro/${libroId}`)
//     .then(response => console.log(response.data))
//     .catch(error => console.error(error));

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
