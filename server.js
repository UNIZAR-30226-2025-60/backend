const express = require("express");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
require("dotenv").config();
const fs = require('fs');
const path = require('path');

const { sequelize, pool } = require("./db/db");
const { User } = require("./models/User");  
const { Libro } = require("./models/Libro"); 
const { Tema } = require("./models/Tema");  
const { Opinion } = require("./models/Opiniones");
const { Lista } = require("./models/Listas");
const { Fragmento } = require("./models/Fragmento");
const { Leido } = require("./models/Leido");


// Importar rutas
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const librosRoutes = require("./routes/libros");
const usuariosRoutes = require("./routes/usuarios");
const apiForoRoutes = require('./routes/APIforo');
const opinionesRoutes = require("./routes/opiniones");  
const listasRoutes = require("./routes/listas");
const fragmentosRoutes = require("./routes/fragmentos");
const estadisticasRoutes = require("./routes/estadisticas");
const proxyPDF = require('./routes/proxyPDF');

const { FOREIGNKEYS } = require("sequelize/lib/query-types");

const app = express();
const PORT = process.env.PORT || 3000;


if( process.env.NODE_ENV !== 'test'){
  const swaggerJsdoc = require('swagger-jsdoc');
  const swaggerUi = require('swagger-ui-express');
  
  // Configuración de Swagger
  const swaggerOptions = {
    definition: {
      openapi: '3.0.0',  // Usamos OpenAPI 3.0
      info: {
        title: 'Mi API',
        version: '1.0.0',
        description: 'Documentación de la API de mi aplicación'
      },
      servers: [
        {
          url: 'http://localhost:5000',  // URL de la API en desarrollo
        }
      ]
    },
    apis: ['./routes/*.js'],  // Ruta a los archivos donde se documentan las rutas de tu API
  };

  // Generamos la documentación de Swagger
  const swaggerDocs = swaggerJsdoc(swaggerOptions);
  
  // Devolvemos la documentación de Swagger en la ruta /api-docs
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
  
  //Rutas de nuestra API
  app.get("/", (req, res) => {
    res.send("Bienvenido a la API de Bookly");
  });
}

app.set("trust proxy", 1);// Para que las cookies funcionen en producción(render)

// Configuración de CORS
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:8081",
  process.env.RENDER_FRONTEND_URL || "https://booklyweb-469w.onrender.com"
];

// app.use(
//   cors({
//     origin: allowedOrigins,
//     credentials: true,
//   })
// );
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, 
  })
);

// Middleware para procesar JSON
app.use(express.json());

// Sincronizar base de datos con Sequelize
// sequelize
//   .sync({ force: false })
//   .then(() => console.log("✅ Base de datos sincronizada."))
//   .catch((err) => console.error("❌ Error al sincronizar DB:", err));

if (require.main === module) {
  sequelize.sync({ force: false }) // Cambia a `true` si deseas sobrescribir la estructura
    .then(() => console.log("✅ Base de datos sincronizada."))
    .catch((err) => console.error("❌ Error al sincronizar DB:", err));

  // Ejecutar triggers.sql
  (async () => {
    try {
      const triggersPath = path.join(__dirname, 'triggers.sql');
      const triggersSQL = fs.readFileSync(triggersPath, 'utf-8');
      await pool.query(triggersSQL);
      console.log('✅ Triggers ejecutados correctamente.');
    } catch (error) {
      console.error('❌ Error al ejecutar triggers:', error);
    }
  })();
}

// Configuración de sesión
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false, // Evita sesiones vacías
    cookie: {
      // httpOnly: true,
      httpOnly: false,
      // secure: false,
      // sameSite: "lax",
      secure: process.env.NODE_ENV === "production", // true en producción
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

// Configurar estrategia de Google OAuth
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // callbackURL: process.env.GOOGLE_REDIRECT_URI,
      callbackURL: process.env.NODE_ENV === "production"
      ? process.env.RENDER_GOOGLE_REDIRECT_URI // En producción, Render
      : process.env.GOOGLE_REDIRECT_URI,      // En local, localhost
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ where: { correo: profile.emails[0].value } });
        if (!user) {
          user = await User.create({
            correo: profile.emails[0].value,
            nombre: profile.displayName,
            contrasena: null,
          });
        }
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Serializar y deserializar usuario
passport.serializeUser((user, done) => {
  done(null, user.correo);
});

passport.deserializeUser(async (correo, done) => {
  try {
    const user = await User.findOne({ where: { correo } });
    console.log("🔄 Deserializando usuario:", user?.correo); // Verifica si el usuario se carga
    done(null, user ? user.get({ plain: true }) : null);
  } catch (error) {
    done(error, null);
  }
});


if (require.main === module) {
  (async () => {
    try {
      console.log("🛠 Conectando a la base de datos en:", process.env.DATABASE_URL);
      await sequelize.authenticate();
      console.log('✅ Conexión a la base de datos establecida con éxito.');

      await sequelize.sync({ force: false });
      console.log("✅ Base de datos sincronizada.");
    } catch (error) {
      console.error('❌ Error al conectar o sincronizar la base de datos:', error);
      process.exit(1);
    }
  })();
}


// Usar rutas
app.use("/auth", authRoutes);
app.use("/api", userRoutes);
app.use("/api/libros", librosRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api", usuariosRoutes);
app.use("/api", apiForoRoutes);
app.use("/api/opiniones", opinionesRoutes); 
app.use("/api/listas", listasRoutes);
app.use("/api/fragmentos", fragmentosRoutes);
app.use("/api/estadisticas", estadisticasRoutes);
app.use('/api', proxyPDF);


app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate(); // Testea conexión real a la DB
    res.status(200).json({ status: 'ok', message: 'Base de datos sincronizada.' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error al conectar con la base de datos.' });
  }
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Base de datos OK' });
});



// Iniciar servidor
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor corriendo en http://0.0.0.0:${PORT}`);
  });
}

module.exports = { app, sequelize };

