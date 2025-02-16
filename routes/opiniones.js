const express = require('express');
const router = express.Router();
const { Libro } = require('../models/Libro');
const { Opinion } = require('../models/Opiniones');

// Probandolo con esto:
// http://localhost:3000/api/opiniones/https%3A%2F%2Fdrive.google.com%2Ffile%2Fd%2F13DBqA252BfbCTaDJJOBXfqix6QypqQyB%2Fview%3Fusp%3Dsharing
// (porque debe estar codificado el enlace, luego abajo lo descodifico)

router.get('/:enlace', async (req, res) => {
    try {
        console.log("Enlace recibido: ", req.params.enlace);
        const enlace = decodeURIComponent(req.params.enlace); 
        console.log("Enlace decodificado: ", enlace);

        // Buscar el libro por el enlace
        const libro = await Libro.findOne({ where: { enlace } });
        console.log("Libro encontrado: ", libro);

        if (!libro) {
            return res.status(404).send('Libro no encontrado');
        }

        // Buscar opiniones relacionadas con el libro
        const opiniones = await Opinion.findAll({
            where: { libro_id: enlace } 
        });
        console.log("Opiniones encontradas: ", opiniones);

        res.json(opiniones);
    } catch (error) {
        console.error("Error al obtener las opiniones:", error);
        res.status(500).send('Error al obtener las opiniones');
    }
});

module.exports = router;
