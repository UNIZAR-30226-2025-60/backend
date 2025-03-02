const express = require('express');
const bcrypt = require('bcrypt');  // Importa bcrypt para la encriptación
const router = express.Router();
const axios = require('axios');
const { pool } = require('../db/db');

const { registrarUser } = require('../models/User');

// router.post('/registro', async (req, res) => {
//     const { nombre, correo, contrasena } = req.body;
//     try {
//         const result = await pool.query(
//             'INSERT INTO USUARIO (nombre, correo, contrasena) VALUES ($1, $2, $3) RETURNING *',
//             [nombre, correo, contrasena]
//         );
//         res.status(201).json(result.rows[0]);
//     } catch (error) {
//         res.status(500).send('Error al registrar usuario');
//     }
// });

//Ruta para obtener toda la información de un usuario
router.get("/usuario/:correo", async (req, res) => {
  const { correo } = req.params;
  try {
    const result = await pool.query("SELECT * FROM USUARIO WHERE correo = $1", [correo]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(result.rows[0]); // Enviamos todos los datos del usuario
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    res.status(500).json({ error: "Error al obtener usuario" });
  }
});

// Ruta para cambiar la contraseña dado un usuario, su contraseña actual y su nueva contraseña
router.post("/usuario/cambiar-contrasena", async (req, res) => {
  const { correo, oldPassword, newPassword } = req.body;

  try {
    // Paso 1: Buscar el usuario por su correo
    const result = await pool.query("SELECT * FROM USUARIO WHERE correo = $1", [correo]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const user = result.rows[0];

    // Paso 2: Verificar la contraseña antigua (cifrada)
    const isMatch = await bcrypt.compare(oldPassword, user.contrasena);
    if (!isMatch) {
      return res.status(400).json({ error: "La contraseña actual es incorrecta" });
    }

    // Paso 3: Cifrar la nueva contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Paso 4: Actualizar la contraseña en la base de datos
    const updateResult = await pool.query(
      "UPDATE USUARIO SET contrasena = $1 WHERE correo = $2",
      [hashedPassword, correo]
    );

    if (updateResult.rowCount === 0) {
      return res.status(400).json({ error: "No se pudo actualizar la contraseña" });
    }

    return res.status(200).json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error("Error al cambiar la contraseña:", error);
    res.status(500).json({ error: "Hubo un error al cambiar la contraseña" });
  }
});

// Ruta para registrar y dejar la sesión iniciado automáticamente de un nuevo usuario en el sistema
router.post('/registro', async (req, res) => {
    console.log('Datos recibidos en el backend:', req.body);
    const { nombre, correo, contrasena } = req.body;
    try {
        // Encriptar la contraseña antes de guardarla
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(contrasena, saltRounds);

        const userResult = await pool.query(
            'INSERT INTO USUARIO (nombre, correo, contrasena) VALUES ($1, $2, $3) RETURNING *',
            [nombre, correo, hashedPassword]
        );
        const newUser = userResult.rows[0];

        const listaResult = await pool.query(
            'INSERT INTO LISTA (nombre, usuario_id, publica, descripcion) VALUES ($1, $2, $3, $4) RETURNING *',
            ['Mis Favoritos', newUser.correo, false, 'Tu lista personal de favoritos']
        );

        req.login(newUser, (err) => {
            if (err) {
                console.error('Error al iniciar sesión automáticamente:', err);
                return res.status(500).send('Error al iniciar sesión');
            }
            console.log('Usuario autenticado:', newUser);
            console.log('Sesión actual:', req.session);
            req.session.save((err) => {
                if (err) {
                    console.error('Error al guardar sesión:', err);
                    return res.status(500).send('Error al guardar sesión');
                }
                res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8081');
                res.setHeader('Access-Control-Allow-Credentials', 'true');
                res.status(201).json({ usuario: newUser, listaFavoritos: listaResult.rows[0] });
            });
        });
    } catch (error) {
        console.error('Error al registrar usuario y crear lista de favoritos:', error);
        res.status(500).send('Error al registrar usuario: ' + error.message);
    }
});

// Ruta para iniciar sesión de un usuario ya registrado en el sistema
router.post('/login', async (req, res) => {
    const { correo, contrasena } = req.body;
    try {
        const result = await pool.query(
            'SELECT * FROM USUARIO WHERE correo = $1',
            [correo]
        );

        if (result.rows.length === 0) {
            return res.status(401).send('Correo o contraseña incorrectos');
        }

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(contrasena, user.contrasena);
        if (!isMatch) {
            return res.status(401).send('Correo o contraseña incorrectos');
        }
        req.login(user, (err) => {
            if (err) {
                console.error('Error al iniciar sesión:', err);
                return res.status(500).send('Error al iniciar sesión');
            }
            req.session.save((err) => {
                if (err) {
                    console.error('Error al guardar sesión:', err);
                    return res.status(500).send('Error al guardar sesión');
                }
                res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8081');
                res.setHeader('Access-Control-Allow-Credentials', 'true');
                res.status(200).json(user);
            });
        });
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).send('Error al iniciar sesión: ' + error.message);
    }
});













//Ruta para actualizar el proceso de lectura de un libro por un usuario
router.post('/guardar-progreso', async (req, res) => {
    const { correo, enlace, pagina } = req.body;
    try {
      await pool.query(
        `INSERT INTO en_proceso (usuario_id, libro_id, pagina)
         VALUES ($1, $2, $3)
         ON CONFLICT (usuario_id, libro_id) DO UPDATE SET pagina = $3`,
        [correo, enlace, pagina]
      );
      res.status(200).json({ mensaje: "Progreso guardado" });
    } catch (error) {
      res.status(500).json({ error: "Error al guardar progreso" });
    }
  });


//Ruta para cargar el proceso de lectura de un libro por un usuario
  router.get('/cargar-progreso/:correo/:enlace', async (req, res) => {
    const { correo, enlace } = req.params;
    try {
      const result = await pool.query(
        'SELECT pagina FROM en_proceso WHERE usuario_id = $1 AND libro_id = $2',
        [correo, enlace]
      );
      const pagina = result.rows[0] ? result.rows[0].pagina : 1;
      res.json({ pagina });
    } catch (error) {
      res.status(500).json({ error: "Error al cargar progreso" });
    }
  });
  


//Ruta para guardar un fragmento destacado por un usuario
  router.post('/guardar-fragmento', async (req, res) => {
    const { correo, enlace, pagina, fragmento } = req.body;
    try {
      await pool.query(
        `INSERT INTO destacar_fragmento (enlace, correo, pagina, fragmento)
         VALUES ($1, $2, $3, $4)`,
        [enlace, correo, pagina, fragmento]
      );
      res.status(201).json({ mensaje: "Fragmento guardado" });
    } catch (error) {
      res.status(500).json({ error: "Error al guardar fragmento" });
    }
  });
  


  router.get('/obtener-pdf/:id', async (req, res) => {
    const fileId = req.params.id;
    const url = `https://drive.google.com/uc?id=${fileId}&export=download`;
  
    console.log("🔹 Intentando obtener PDF con ID:", fileId);
    console.log("🔹 URL generada:", url);
  
    try {
      const response = await axios.get(url, { responseType: 'arraybuffer' });
  
      console.log("✅ PDF obtenido con éxito desde Google Drive");
  
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Access-Control-Allow-Origin', '*'); 
      res.setHeader('Access-Control-Allow-Credentials', 'true');
  
      res.send(response.data);
    } catch (error) {
      console.error("❌ Error al obtener PDF:", error.message);
      res.status(500).send(`Error al obtener el PDF: ${error.message}`);
    }
  });
 
module.exports = router;
