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
/**
 * @swagger
 * /api/usuario/{correo}:
 *   get:
 *     summary: Obtener toda la información de un usuario
 *     description: Obtiene todos los detalles de un usuario dado su correo electrónico.
 *     parameters:
 *       - in: path
 *         name: correo
 *         required: true
 *         description: Correo del usuario
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Datos del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 correo:
 *                   type: string
 *                 nombre:
 *                   type: string
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error al obtener usuario
 */
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
/**
 * @swagger
 * /api/usuario/cambiar-contrasena:
 *   post:
 *     summary: Cambiar la contraseña de un usuario
 *     description: Permite a un usuario cambiar su contraseña. Se requiere la contraseña actual y la nueva contraseña.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               correo:
 *                 type: string
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contraseña actualizada correctamente
 *       400:
 *         description: La contraseña actual es incorrecta o faltan parámetros
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error al cambiar la contraseña
 */
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

// Ruta para saber si un usuario se registró mediante Google
/**
 * @swagger
 * /api/usuario/esGoogle/{correo}:
 *   get:
 *     summary: Verificar si un usuario se ha registrado con Google
 *     description: Devuelve un valor booleano que indica si el usuario se registró mediante Google (cuando la contraseña es nula).
 *     parameters:
 *       - in: path
 *         name: correo
 *         required: true
 *         description: Correo electrónico del usuario que se desea verificar
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Respuesta indicando si el usuario se registró con Google
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 esGoogle:
 *                   type: boolean
 *                   description: Indica si el usuario se ha registrado con Google (true) o no (false)
 *       500:
 *         description: Error al verificar el registro de usuario
 */
router.get("/usuario/esGoogle/:correo", async (req, res) => {
  const { correo } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM USUARIO WHERE correo = $1 AND contrasena IS NULL",
      [correo]
    );

    if (result.rows.length > 0) {
      return res.json({ esGoogle: true });
    } else {
      return res.json({ esGoogle: false });
    }
  } catch (error) {
    console.error("Error al verificar si el usuario es de Google:", error);
    res.status(500).json({ error: "Error en la verificación" });
  }
});


// Ruta para registrar y dejar la sesión iniciado automáticamente de un nuevo usuario en el sistema
/**
 * @swagger
 * /api/registro:
 *   post:
 *     summary: Registrar un nuevo usuario y autenticarlo
 *     description: Registra un nuevo usuario en el sistema y lo autentica automáticamente, creando también la lista "Mis Favoritos".
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               correo:
 *                 type: string
 *               contrasena:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario registrado y sesión iniciada correctamente
 *       500:
 *         description: Error al registrar el usuario o iniciar sesión
 */
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

      // Verificar si la lista "Mis Favoritos" ya existe para este usuario
      const listaExistente = await pool.query(
          'SELECT * FROM LISTA WHERE nombre = $1 AND usuario_id = $2',
          ['Mis Favoritos', newUser.correo]
      );

      let listaFavoritos;
      if (listaExistente.rows.length === 0) {
          // Si no existe, creamos la lista
          const listaResult = await pool.query(
              'INSERT INTO LISTA (nombre, usuario_id, publica, descripcion) VALUES ($1, $2, $3, $4) RETURNING *',
              ['Mis Favoritos', newUser.correo, false, 'Tu lista personal de favoritos']
          );
          listaFavoritos = listaResult.rows[0];
      } else {
          // Si ya existe, la utilizamos directamente
          listaFavoritos = listaExistente.rows[0];
      }

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
              res.status(201).json({ usuario: newUser, listaFavoritos });
          });
      });
  } catch (error) {
      console.error('Error al registrar usuario y crear lista de favoritos:', error);
      res.status(500).send('Error al registrar usuario: ' + error.message);
  }
});

// Ruta para registrar y dejar la sesión iniciado automáticamente de un nuevo usuario en el sistema (en móvil)
/**
 * @swagger
 * /api/registroM:
 *   post:
 *     summary: Registrar un nuevo usuario y autenticarlo en móvil
 *     description: Registra un nuevo usuario y lo autentica en la aplicación móvil, creando también la lista "Mis Favoritos".
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               correo:
 *                 type: string
 *               contrasena:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario registrado y sesión iniciada correctamente
 *       500:
 *         description: Error al registrar el usuario o iniciar sesión
 */
router.post('/registroM', async (req, res) => {
  console.log('Datos recibidos en el backend:', req.body);
  const { nombre, correo, contrasena } = req.body;

  try {
      let hashedPassword = null;

      // Solo encriptar si la contraseña no es nula
      if (contrasena) {
          const saltRounds = 10;
          hashedPassword = await bcrypt.hash(contrasena, saltRounds);
      }

      const userResult = await pool.query(
          'INSERT INTO USUARIO (nombre, correo, contrasena) VALUES ($1, $2, $3) ON CONFLICT (correo) DO NOTHING RETURNING *',
          [nombre, correo, hashedPassword]
      );

      let newUser;
      if (userResult.rows.length > 0) {
          newUser = userResult.rows[0];
      } else {
          const existingUser = await pool.query('SELECT * FROM USUARIO WHERE correo = $1', [correo]);
          newUser = existingUser.rows[0];
      }

      // Verificar si la lista "Mis Favoritos" ya existe para este usuario
      const listaExistente = await pool.query(
          'SELECT * FROM LISTA WHERE nombre = $1 AND usuario_id = $2',
          ['Mis Favoritos', newUser.correo]
      );

      let listaFavoritos;
      if (listaExistente.rows.length === 0) {
          const listaResult = await pool.query(
              'INSERT INTO LISTA (nombre, usuario_id, publica, descripcion) VALUES ($1, $2, $3, $4) RETURNING *',
              ['Mis Favoritos', newUser.correo, false, 'Tu lista personal de favoritos']
          );
          listaFavoritos = listaResult.rows[0];
      } else {
          listaFavoritos = listaExistente.rows[0];
      }

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
              res.status(201).json({ usuario: newUser, listaFavoritos });
          });
      });
  } catch (error) {
      console.error('Error al registrar usuario y crear lista de favoritos:', error);
      res.status(500).send('Error al registrar usuario: ' + error.message);
  }
});


// Ruta para iniciar sesión de un usuario ya registrado en el sistema
/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Iniciar sesión de un usuario
 *     description: Permite a un usuario ya registrado iniciar sesión proporcionando su correo y contraseña.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               correo:
 *                 type: string
 *               contrasena:
 *                 type: string
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *       401:
 *         description: Correo o contraseña incorrectos
 *       500:
 *         description: Error al iniciar sesión
 */
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
                // Cambio la URL del frontend según el entorno
                const frontendUrl = process.env.RENDER ? process.env.RENDER_FRONTEND_URL : process.env.FRONTEND_URL;

                res.setHeader('Access-Control-Allow-Origin', frontendUrl);
                res.setHeader('Access-Control-Allow-Credentials', 'true');
                res.status(200).json(user);
            });
        });
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).send('Error al iniciar sesión: ' + error.message);
    }
});


// Para el login en movil
/**
 * @swagger
 * /api/loginM:
 *   post:
 *     summary: Iniciar sesión de un usuario (móvil)
 *     description: Permite a un usuario móvil iniciar sesión proporcionando su correo y contraseña.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               correo:
 *                 type: string
 *               contrasena:
 *                 type: string
 *     responses:
 *       200:
 *         description: Inicio de sesión móvil exitoso
 *       401:
 *         description: Correo o contraseña incorrectos
 *       500:
 *         description: Error al iniciar sesión
 */
router.post('/loginM', async (req, res) => {
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

              //No definir Access-Control-Allow-Origin
              res.status(200).json(user);
          });
      });
  } catch (error) {
      console.error('Error al iniciar sesión:', error);
      res.status(500).send('Error al iniciar sesión: ' + error.message);
  }
});
  
// Cambiar el nombre de un usuario
/**
 * @swagger
 * /api/usuario/cambiar-nombre:
 *   post:
 *     summary: Cambiar el nombre de un usuario
 *     description: Permite a un usuario cambiar su nombre proporcionado un correo y el nuevo nombre.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               correo:
 *                 type: string
 *               nombre:
 *                 type: string
 *     responses:
 *       200:
 *         description: Nombre actualizado correctamente
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error al cambiar el nombre
 */
router.post('/usuario/cambiar-nombre', async (req, res) => {
  const { correo, nombre } = req.body;

  try {
    const result = await pool.query(
      'UPDATE USUARIO SET nombre = $1 WHERE correo = $2 RETURNING *',
      [nombre, correo]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al cambiar el nombre:", error);
    res.status(500).json({ error: "Error al cambiar el nombre" });
  }
});

// Cambiar la imagen de perfil de un usuario
/**
 * @swagger
 * /api/usuario/cambiar-foto:
 *   post:
 *     summary: Cambiar la imagen de perfil de un usuario
 *     description: Permite a un usuario actualizar su foto de perfil proporcionada en la solicitud.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               correo:
 *                 type: string
 *                 description: Correo electrónico del usuario cuya foto de perfil se desea actualizar
 *               foto_perfil:
 *                 type: string
 *                 description: URL de la nueva imagen de perfil
 *     responses:
 *       200:
 *         description: Imagen de perfil actualizada con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 correo:
 *                   type: string
 *                 foto_perfil:
 *                   type: string
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error al cambiar la imagen de perfil
 */
router.post('/usuario/cambiar-foto', async (req, res) => {
  const { correo, foto_perfil } = req.body;
  try {
    const result = await pool.query(
      'UPDATE USUARIO SET foto_perfil = $1 WHERE correo = $2 RETURNING *',
      [foto_perfil, correo]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al cambiar la imagen de perfil:", error);
    res.status(500).json({ error: "Error al cambiar la imagen de perfil" });
  }
});

// Guardar la última página leída automáticamente
/**
 * @swagger
 * /api/guardar-pagina:
 *   post:
 *     summary: Guardar la última página leída de un libro por un usuario
 *     description: Permite a un usuario guardar la última página leída de un libro específico.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               correo:
 *                 type: string
 *               libro_id:
 *                 type: string
 *               pagina:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Página guardada correctamente
 *       400:
 *         description: URL del libro no válida o el libro no existe en la base de datos
 *       500:
 *         description: Error al guardar la página
 */
router.post('/guardar-pagina', async (req, res) => {
  let { correo, libro_id, pagina } = req.body;

  console.log("📩 Correo recibido antes de decodificar:", correo);
  correo = decodeURIComponent(correo); // Decodificar correo
  console.log("✅ Correo decodificado:", correo);

  // Extraer el ID real del libro desde la URL proxy-pdf
  const match = libro_id.match(/id=([^&]+)/);
  if (!match || !match[1]) {
    return res.status(400).json({ error: "❌ URL del libro no válida" });
  }
  const fileId = match[1];

  // Convertirlo al formato almacenado en Neon
  const libroIdReal = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
  console.log("📖 ID real del libro en Neon:", libroIdReal);

  try {
    // Verificar que el libro existe en la base de datos
    const libroExiste = await pool.query(`SELECT * FROM libro WHERE enlace = $1`, [libroIdReal]);
    if (libroExiste.rows.length === 0) {
      return res.status(400).json({ error: "❌ El libro no existe en la base de datos" });
    }

    // 🔥 Insertar o actualizar en una sola consulta con `ON CONFLICT`
    const result = await pool.query(`
      INSERT INTO en_proceso (usuario_id, libro_id, pagina)
      VALUES ($1, $2, $3)
      ON CONFLICT (usuario_id, libro_id) DO UPDATE
      SET pagina = EXCLUDED.pagina
      RETURNING *;
    `, [correo, libroIdReal, pagina]);

    console.log("✅ Página guardada o actualizada:", result.rows[0]);
    res.status(200).json({ mensaje: "✅ Página guardada correctamente", data: result.rows[0] });

  } catch (error) {
    console.error("❌ Error en guardar-pagina:", error);
    res.status(500).json({ error: "❌ Error al guardar página", detalle: error.message });
  }
});


// Obtener última página leída
/**
 * @swagger
 * /api/ultima-pagina:
 *   get:
 *     summary: Obtener la última página leída por un usuario de un libro
 *     description: Obtiene la última página leída por un usuario de un libro específico.
 *     parameters:
 *       - in: query
 *         name: correo
 *         required: true
 *         description: Correo del usuario
 *         schema:
 *           type: string
 *       - in: query
 *         name: libro_id
 *         required: true
 *         description: ID del libro
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Página obtenida correctamente
 *       404:
 *         description: No se encontró progreso guardado, devolviendo 1
 *       500:
 *         description: Error al obtener la última página
 */
router.get('/ultima-pagina', async (req, res) => {
  let { correo, libro_id } = req.query;

  console.log("📩 Correo recibido antes de decodificar:", correo);
  console.log("📖 Libro ID recibido antes de decodificar:", libro_id);

  try {
    // Decodificar correo y libro_id
    const decodedCorreo = decodeURIComponent(correo);
    const decodedLibroId = decodeURIComponent(libro_id);

    console.log("✅ Correo decodificado:", decodedCorreo);
    console.log("✅ Libro ID decodificado:", decodedLibroId);

    // **Eliminar cualquier dominio (localhost o Render) y la parte del proxy**
    const libroIdNeon = decodedLibroId
      .replace(/^https?:\/\/[^\/]+\/api\/proxy-pdf\?url=/, '') // 🔥 Esto elimina cualquier dominio y la parte del proxy
      .replace(/&export=download$/, '') // Eliminar el export=download
      .replace('https://drive.google.com/uc?id=', 'https://drive.google.com/file/d/') + '/view?usp=sharing'; // Convertir a formato guardado

    console.log("📖 ID del libro convertido para consulta en BD:", libroIdNeon);

    // Consultar en la base de datos con el formato correcto
    const result = await pool.query(
      `SELECT pagina FROM en_proceso WHERE usuario_id = $1 AND libro_id = $2`,
      [decodedCorreo, libroIdNeon]
    );

    if (result.rows.length > 0) {
      console.log("📌 Página encontrada en BD:", result.rows[0].pagina);
    } else {
      console.warn("⚠️ No se encontró progreso guardado, devolviendo 1.");
        // Insertar el libro en la lista "En proceso" si no existe progreso guardado
        await pool.query(
          `INSERT INTO libros_lista (usuario_id, enlace_libro, nombre_lista)
           VALUES ($1, $2, $3)
           ON CONFLICT (usuario_id, enlace_libro, nombre_lista) DO NOTHING;`,
          [decodedCorreo, libroIdNeon, "En proceso"]
      );

      console.log("📚 Libro añadido automáticamente a la lista 'En proceso'.");
    }

    res.json({ pagina: result.rows[0]?.pagina || 1 });

  } catch (error) {
    console.error("❌ Error al obtener la última página:", error);
    res.status(500).json({ error: "Error al obtener página" });
  }
});



// Guardar páginas favoritas
/**
 * @swagger
 * /api/guardar-favorita:
 *   post:
 *     summary: Guardar una página como favorita
 *     description: Permite a un usuario guardar una página de un libro como favorita.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               correo:
 *                 type: string
 *               enlace:
 *                 type: string
 *               pagina:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Página favorita guardada correctamente
 *       500:
 *         description: Error al guardar página favorita
 */
router.post('/guardar-favorita', async (req, res) => {
  let { correo, enlace, pagina } = req.body;

  console.log("📩 Correo recibido antes de decodificar:", correo);
  correo = decodeURIComponent(correo);  // 🔥 Decodificar el correo
  console.log("✅ Correo decodificado:", correo);

  console.log("📌 Enlace recibido antes de procesar:", enlace);

  try {
    // Transformar la URL si es del proxy
    const match = enlace.match(/id=([^&]+)/);
    if (match && match[1]) {
      const fileId = match[1];
      enlace = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
    }

    console.log("✅ Enlace convertido para Neon:", enlace);

    await pool.query(`
      INSERT INTO destacar_fragmento (enlace, correo, pagina)
      VALUES ($1, $2, $3)
      ON CONFLICT DO NOTHING
    `, [enlace, correo, pagina]);

    res.status(200).json({ mensaje: "✅ Página favorita guardada" });
  } catch (error) {
    console.error("❌ Error al guardar página favorita:", error);
    res.status(500).json({ error: "❌ Error al guardar página favorita", detalle: error.message });
  }
});

// Eliminar páginas favoritas
/**
 * @swagger
 * /api/eliminar-favorita:
 *   delete:
 *     summary: Eliminar una página de las favoritas
 *     description: Permite a un usuario eliminar una página de su lista de páginas favoritas.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               correo:
 *                 type: string
 *               enlace:
 *                 type: string
 *               pagina:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Página favorita eliminada correctamente
 *       404:
 *         description: La página no estaba marcada como favorita
 *       500:
 *         description: Error al eliminar página favorita
 */
router.delete('/eliminar-favorita', async (req, res) => {
  let { correo, enlace, pagina } = req.body;

  console.log("📩 Correo recibido antes de decodificar:", correo);
  correo = decodeURIComponent(correo);  // 🔥 Decodificar el correo
  console.log("✅ Correo decodificado:", correo);

  console.log("📌 Enlace recibido antes de procesar:", enlace);

  try {
    // Transformar la URL si es del proxy
    const match = enlace.match(/id=([^&]+)/);
    if (match && match[1]) {
      const fileId = match[1];
      enlace = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
    }

    console.log("✅ Enlace convertido para Neon:", enlace);

    const result = await pool.query(`
      DELETE FROM destacar_fragmento
      WHERE enlace = $1 AND correo = $2 AND pagina = $3
    `, [enlace, correo, pagina]);

    if (result.rowCount > 0) {
      res.status(200).json({ mensaje: "✅ Página favorita eliminada" });
    } else {
      res.status(404).json({ mensaje: "⚠️ La página no estaba marcada como favorita" });
    }
  } catch (error) {
    console.error("❌ Error al eliminar página favorita:", error);
    res.status(500).json({ error: "❌ Error al eliminar página favorita", detalle: error.message });
  }
});

/**
 * @swagger
 * /api/verificar-favorita:
 *   get:
 *     summary: Verificar si una página está marcada como favorita
 *     description: Permite verificar si una página de un libro es favorita para un usuario.
 *     parameters:
 *       - in: query
 *         name: correo
 *         required: true
 *         description: Correo del usuario
 *         schema:
 *           type: string
 *       - in: query
 *         name: enlace
 *         required: true
 *         description: Enlace del libro
 *         schema:
 *           type: string
 *       - in: query
 *         name: pagina
 *         required: true
 *         description: Número de la página
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: La página es favorita
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 esFavorita:
 *                   type: boolean
 *       500:
 *         description: Error al verificar favorita
 */
router.get('/verificar-favorita', async (req, res) => {
  let { correo, enlace, pagina } = req.query;

  console.log("📩 Correo recibido antes de decodificar:", correo);
  correo = decodeURIComponent(correo);  // 🔥 Decodificar el correo
  console.log("✅ Correo decodificado:", correo);

  console.log("📌 Enlace recibido antes de procesar:", enlace);
  
  try {
    // Transformar la URL si es del proxy
    const match = enlace.match(/id=([^&]+)/);
    if (match && match[1]) {
      const fileId = match[1];
      enlace = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
    }

    console.log("✅ Enlace convertido para Neon:", enlace);

    // Consulta a la base de datos
    const result = await pool.query(
      `SELECT 1 FROM destacar_fragmento WHERE enlace = $1 AND correo = $2 AND pagina = $3`,
      [enlace, correo, pagina]
    );

    console.log(`📌 Número de filas encontradas: ${result.rowCount}`);

    res.json({ esFavorita: result.rowCount > 0 }); 
  } catch (error) {
    console.error("❌ Error al verificar favorita:", error);
    res.status(500).json({ error: "Error al verificar favorita", detalle: error.message });
  }
});


// Obtener páginas favoritas
router.get('/paginas-favoritas', async (req, res) => {  
  const { correo, enlace } = req.query;

  try {
    const result = await pool.query(`
      SELECT pagina FROM destacar_fragmento
      WHERE correo = $1 AND enlace = $2
    `, [correo, enlace]);

    res.json({ favoritas: result.rows });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener favoritas" });
  }
});

// OBTENER TODAS LAS FOTOS DE PERFIL
// Probar:
//      GET http://localhost:3000/api/usuarios/fotos-perfil

/**
 * @swagger
 * /api/fotos-perfil:
 *   get:
 *     summary: Obtener todas las fotos de perfil
 *     description: Permite obtener todas las fotos de perfil disponibles.
 *     responses:
 *       200:
 *         description: Lista de fotos de perfil
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   url:
 *                     type: string
 *       500:
 *         description: Error al obtener fotos de perfil
 */
router.get('/fotos-perfil', async (req, res) => {
  try {
      const query = 'SELECT url FROM imagen_perfil';
      const { rows } = await pool.query(query);

      res.json(rows);
  } catch (error) {
      console.error('Error al obtener fotos de perfil:', error);
      res.status(500).send('Error interno del servidor');
  }
});

// Ruta para obtener un pdf almacenado en Google Drive
/**
 * @swagger
 * /api/obtener-pdf/{id}:
 *   get:
 *     summary: Obtener un PDF de Google Drive
 *     description: Permite obtener un PDF almacenado en Google Drive dado un ID de archivo.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del archivo en Google Drive
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: PDF obtenido correctamente
 *       500:
 *         description: Error al obtener el PDF
 */
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
 

  const isLocal = process.env.NODE_ENV !== "production";
  const FRONTEND_URL = isLocal
    ? "http://localhost:8081"
    : "https://booklyweb-469w.onrender.com";
  
// Ruta para cerrar sesión y eliminar cookies
router.get("/logout", (req, res) => {
  // Eliminar cookies
  res.clearCookie("connect.sid", {
    path: "/",
    domain: isLocal ? undefined : "booklyweb-469w.onrender.com",  // Dominio en producción
    secure: process.env.NODE_ENV === "production", // Asegúrate de que sea seguro en producción
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Configuración SameSite
  });
  res.clearCookie("userEmail", {
    path: "/",
    domain: isLocal ? undefined : "booklyweb-469w.onrender.com",  // Dominio en producción
    secure: process.env.NODE_ENV === "production", // Asegúrate de que sea seguro en producción
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Configuración SameSite
  });
  res.clearCookie("isGoogleAuth", {
    path: "/",
    domain: isLocal ? undefined : "booklyweb-469w.onrender.com",  // Dominio en producción
    secure: process.env.NODE_ENV === "production", // Asegúrate de que sea seguro en producción
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Configuración SameSite
  });
  
  // Responder con un mensaje de sesión cerrada
  res.send("Sesión cerrada correctamente.");
});





  //RELATIVO A CHATBOT
  async function getUserReadingBooks(userEmail) {
    const result = await pool.query(`
      SELECT libro.nombre, libro.autor, t.tematica
      FROM libro
      JOIN tema_asociado t ON t.enlace = libro.enlace
      JOIN en_proceso ON en_proceso.libro_id = libro.enlace
      WHERE en_proceso.usuario_id = $1
    `, [userEmail]);
  
    return result.rows;
  }
  
  async function getUserReadBooks(userEmail) {
    const result = await pool.query(`
      SELECT libro.nombre, libro.autor, t.tematica
      FROM libro
      JOIN tema_asociado t ON t.enlace = libro.enlace
      JOIN leidos ON leidos.libro_id = libro.enlace
      WHERE leidos.usuario_id = $1
    `, [userEmail]);
  
    return result.rows;
  }
  
  async function getUserFavoriteBooks(userEmail) {
    const result = await pool.query(`
      SELECT libro.nombre, libro.autor, t.tematica
      FROM libro
      JOIN tema_asociado t ON t.enlace = libro.enlace
      JOIN libros_lista ON libros_lista.enlace_libro = libro.enlace
      WHERE libros_lista.usuario_id = $1
    `, [userEmail]);
  
    return result.rows;
  }
  
  router.post('/recomendar', async (req, res) => {
    const { userEmail, userMessage } = req.body;
  
    try {
      // Obtener los libros en proceso, leídos y favoritos del usuario
      const readingBooks = await getUserReadingBooks(userEmail);
      const readBooks = await getUserReadBooks(userEmail);
      const favoriteBooks = await getUserFavoriteBooks(userEmail);
  
      // Crear el contexto para Mistral
      const readingContext = readingBooks.map(book => `${book.nombre} de ${book.autor} (${book.tema_asociado})`).join(', ');
      const readContext = readBooks.map(book => `${book.nombre} de ${book.autor} (${book.tema_asociado})`).join(', ');
      const favoriteContext = favoriteBooks.map(book => `${book.nombre} de ${book.autor} (${book.tema_asociado})`).join(', ');
  
      // Crear el mensaje completo para Mistral
      const fullMessage = `
        Consulta: ${userMessage}.
        Esa es la pregunta que hace un usuario en esta app, bookly, de lectura de libros,
        y aquí tienes la información que tenemos sobre el usuario. Estas siendo usado como chatbot. Y el usuario piensa que eres un chatbot simplemente
        espera respuestas cortas y concretas y adaptadas a la información que te doy. Es decir, usa la información que tienes que esta debajo de esto
        en caso de que sea relevane. Da respuestas cortillas y sencillas, si te pregunta por ejemplo que tal o te saluda se conciso y amable. Igual
        puedes preguntar que tal van sus lecturas pero no usar toda la información que tienes. Solo la necesaria. y asi para todo tipo de pregunta        A CERCA DEL USUARIO:
        - SE ESTÁ LEYENDO: ${readingContext}.
        - SE HA LEÍDO: ${readContext}.
        - SUS FAVORITOS: ${favoriteContext}.
        RESPONDE SABIENDO ESTO.
        Además, su nombre es ${userEmail.split('@')[0]}. CONTESTA PERSONALIZADAMENTE.
        Instrucciones:
        - Responde en un tono amigable y conversacional.
        - Actúa como un compañero de lectura.
        - Ofrece recomendaciones basadas en los libros favoritos y lo que está leyendo actualmente.
        - Inicia conversaciones sobre el progreso de lectura si es relevante.
        - Proporciona datos curiosos o anécdotas sobre los libros mencionados.
        - Acaba la respuesta con un emoji amigable y si tiene sentido pregunta si necesita algo más.
        - Y RECUERDA, no uses la información que no es relevante para la pregunta del usuario. Es decir,
        no uses toda la información que tienes. Solo la necesaria. Si no es algo relacionado con la información que tienes
        se breve con tu respuesta y no uses la información que tienes, solo el nombre.
        - Y si no puedes responder a la pregunta del usuario, simplemente di que no puedes ayudarle con eso.
        - Y si no entiendes la pregunta del usuario, simplemente di que no entiendes la pregunta y que lo repita.

      `;
  
      // Enviar la consulta a la API de Mistral
      const response = await axios.post('https://api.mistral.ai/v1/chat/completions', {
        model: 'open-mixtral-8x22b',
        messages: [{ role: 'user', content: fullMessage }],
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.VUE_APP_API_MISTRAL}`,  // Tu clave API de Mistral
        },
      });
  
      // Devolver la respuesta de Mistral al cliente
      res.json({ response: response.data.choices[0].message.content });
    } catch (error) {
      console.error('Error al procesar la recomendación:', error);
      res.status(500).send('Error al procesar la recomendación');
    }
  });
  //AQUI ACABA LO RELATIVO A CHATBOT

module.exports = router;
